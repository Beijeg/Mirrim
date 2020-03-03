// direction enum representing the cardinal directions in RPG Maker (based off numpad keys)
const directions = {
    NORTH: 8,
    EAST: 6,
    SOUTH: 2,
    WEST: 4
};

// direction enum representing the beam/mirror situations (arbitrary numbering)
const beam_context = {
    DEFAULT_INVALID: 0,
    LEFT_DOWN: 1,
    LEFT_UP: 2,
    RIGHT_DOWN: 3,
    RIGHT_UP: 4,

    DOWN_MIR_VERT_BEAM: 5,
    LEFT_MIR_VERT_BEAM: 6,
    RIGHT_MIR_VERT_BEAM: 7,
    UP_MIR_VERT_BEAM: 8,

    DOWN_MIR_HOR_BEAM: 9,
    LEFT_MIR_HOR_BEAM: 10,
    RIGHT_MIR_HOR_BEAM: 11,
    UP_MIR_HOR_BEAM: 12,

    DOWN_PLYR_VERT_BEAM_SOUTH: 13,
    DOWN_PLYR_HOR_BEAM_WEST: 14,
    DOWN_PLYR_VERT_BEAM_NORTH: 15,
    DOWN_PLYR_HOR_BEAM_EAST: 16,

    LEFT_PLYR_VERT_BEAM_SOUTH: 17,
    LEFT_PLYR_HOR_BEAM_WEST: 18,
    LEFT_PLYR_VERT_BEAM_NORTH: 19,
    LEFT_PLYR_HOR_BEAM_EAST: 20,

    RIGHT_PLYR_VERT_BEAM_SOUTH: 21,
    RIGHT_PLYR_HOR_BEAM_WEST: 22,
    RIGHT_PLYR_VERT_BEAM_NORTH: 23,
    RIGHT_PLYR_HOR_BEAM_EAST: 24,

    UP_PLYR_VERT_BEAM_SOUTH: 25,
    UP_PLYR_HOR_BEAM_WEST: 26,
    UP_PLYR_VERT_BEAM_NORTH: 27,
    UP_PLYR_HOR_BEAM_EAST: 28
};

// event ids corresponding to the id's on the spawn map (for the given contexts in 'beam_context')
const red_laser_ids = {};
red_laser_ids[beam_context.LEFT_DOWN] = 3;
red_laser_ids[beam_context.LEFT_UP] = 4;
red_laser_ids[beam_context.RIGHT_DOWN] = 5;
red_laser_ids[beam_context.RIGHT_UP] = 6;

red_laser_ids[beam_context.DOWN_MIR_VERT_BEAM] = 7;
red_laser_ids[beam_context.LEFT_MIR_VERT_BEAM] = 8;
red_laser_ids[beam_context.RIGHT_MIR_VERT_BEAM] = 9;
red_laser_ids[beam_context.UP_MIR_VERT_BEAM] = 10;

red_laser_ids[beam_context.DOWN_MIR_HOR_BEAM] = 11;
red_laser_ids[beam_context.LEFT_MIR_HOR_BEAM] = 12;
red_laser_ids[beam_context.RIGHT_MIR_HOR_BEAM] = 13;
red_laser_ids[beam_context.UP_MIR_HOR_BEAM] = 14;

red_laser_ids[beam_context.DOWN_PLYR_VERT_BEAM_SOUTH] = 15;
red_laser_ids[beam_context.DOWN_PLYR_HOR_BEAM_WEST] = 16;
red_laser_ids[beam_context.DOWN_PLYR_VERT_BEAM_NORTH] = 17;
red_laser_ids[beam_context.DOWN_PLYR_HOR_BEAM_EAST] = 18;

red_laser_ids[beam_context.LEFT_PLYR_VERT_BEAM_SOUTH] = 19;
red_laser_ids[beam_context.LEFT_PLYR_HOR_BEAM_WEST] = 20;
red_laser_ids[beam_context.LEFT_PLYR_VERT_BEAM_NORTH] = 21;
red_laser_ids[beam_context.LEFT_PLYR_HOR_BEAM_EAST] = 24;

red_laser_ids[beam_context.RIGHT_PLYR_VERT_BEAM_SOUTH] = 25;
red_laser_ids[beam_context.RIGHT_PLYR_HOR_BEAM_WEST] = 26;
red_laser_ids[beam_context.RIGHT_PLYR_VERT_BEAM_NORTH] = 22;
red_laser_ids[beam_context.RIGHT_PLYR_HOR_BEAM_EAST] = 27;

red_laser_ids[beam_context.UP_PLYR_VERT_BEAM_SOUTH] = 28;
red_laser_ids[beam_context.UP_PLYR_HOR_BEAM_WEST] = 29;
red_laser_ids[beam_context.UP_PLYR_VERT_BEAM_NORTH] = 23;
red_laser_ids[beam_context.UP_PLYR_HOR_BEAM_EAST] = 30;

// general constants to be used by this plugin and from within the engine
const constants = {
    RedVerticalLaser: 1,
    RedHorizontalLaser: 2,
    RedLeftDownLaser: 3,
    RedLeftUpLaser: 4,
    RedRightDownLaser: 5,
    RedRightUpLaser: 6,
    Direction: 1,
    PlayerX: 2,
    PlayerY: 3,
    EventX: 4,
    EventY: 5,
    VariableA: 6,
    VariableB: 7,
    Laser: 11,
    Receiver: 12,
    LaserDirection: 13,
    LocalVar: 8,
    LocalVar2: 15,
    MapId: 16,
    SwitchId: 17
};

var laser_tile_ids = [constants.RedVerticalLaser, constants.RedHorizontalLaser];
laser_tile_ids = laser_tile_ids.concat(Object.values(red_laser_ids));

function getDirectionTileId(direction){
    if (direction === directions.NORTH || direction === directions.SOUTH){
        return constants.RedVerticalLaser;
    }
    else{
        return constants.RedHorizontalLaser;
    }
}

function getMirrorTileId(context){
    return red_laser_ids[context];
}

function getRedLaserTileId(context){
    return red_laser_ids[context];
}

function isLaserTile(event_id){
    return laser_tile_ids.contains(event_id);
}

function getReflection(in_direction, mirror_direction){
    var out_direction = 0;
    if (in_direction === directions.SOUTH){
        if (mirror_direction === directions.NORTH){
            out_direction = directions.EAST;
        }
        else if(mirror_direction === directions.WEST){
            out_direction = directions.WEST;
        }
    }
    else if (in_direction === directions.EAST){
        if (mirror_direction === directions.WEST){
            out_direction = directions.NORTH;
        }
        else if (mirror_direction === directions.SOUTH){
            out_direction = directions.SOUTH;
        }

    }
    else if (in_direction === directions.NORTH){
        if (mirror_direction === directions.SOUTH){
            out_direction = directions.WEST;
        }
        else if (mirror_direction === directions.EAST){
            out_direction = directions.EAST;
        }

    }
    else if (in_direction === directions.WEST){
        if (mirror_direction === directions.EAST){
            out_direction = directions.SOUTH;
        }
        else if (mirror_direction === directions.NORTH){
            out_direction = directions.NORTH;
        }
    }

    return out_direction;
}

function getPlayerBeamContext(in_direction, player_direction){
    var context = beam_context.DEFAULT_INVALID;
    if (in_direction === directions.SOUTH){
        if (player_direction === directions.NORTH){
            context = beam_context.UP_PLYR_VERT_BEAM_SOUTH;
        }
        else if(player_direction === directions.WEST){
            context = beam_context.LEFT_PLYR_VERT_BEAM_SOUTH;
        }
        else if(player_direction === directions.SOUTH){
            context = beam_context.DOWN_PLYR_VERT_BEAM_SOUTH;
        }
        else if(player_direction === directions.EAST){
            context = beam_context.RIGHT_PLYR_VERT_BEAM_SOUTH;
        }
    }
    else if (in_direction === directions.EAST){
        if (player_direction === directions.WEST){
            context = beam_context.LEFT_PLYR_HOR_BEAM_EAST;
        }
        else if (player_direction === directions.SOUTH){
            context = beam_context.DOWN_PLYR_HOR_BEAM_EAST;
        }
        else if (player_direction === directions.EAST){
            context = beam_context.RIGHT_PLYR_HOR_BEAM_EAST;
        }
        else if (player_direction === directions.NORTH){
            context = beam_context.UP_PLYR_HOR_BEAM_EAST;
        }

    }
    else if (in_direction === directions.NORTH){
        if (player_direction === directions.SOUTH){
            context = beam_context.DOWN_PLYR_VERT_BEAM_NORTH;
        }
        else if (player_direction === directions.EAST){
            context = beam_context.RIGHT_PLYR_VERT_BEAM_NORTH;
        }
        else if (player_direction === directions.NORTH){
            context = beam_context.UP_PLYR_VERT_BEAM_NORTH;
        }
        else if (player_direction === directions.WEST){
            context = beam_context.LEFT_PLYR_VERT_BEAM_NORTH;
        }

    }
    else if (in_direction === directions.WEST){
        if (player_direction === directions.EAST){
            context = beam_context.RIGHT_PLYR_HOR_BEAM_WEST;
        }
        else if (player_direction === directions.NORTH){
            context = beam_context.UP_PLYR_HOR_BEAM_EAST;
        }
        else if (player_direction === directions.WEST){
            context = beam_context.LEFT_PLYR_HOR_BEAM_WEST;
        }
        else if (player_direction === directions.SOUTH){
            context = beam_context.DOWN_PLYR_HOR_BEAM_WEST;
        }
    }

    return context;
}

function getBeamContext(in_direction, mirror_direction){
    var context = beam_context.DEFAULT_INVALID;
    var out_direction = null;
    if (in_direction === directions.SOUTH){
        if (mirror_direction === directions.NORTH){
            context = beam_context.RIGHT_UP;
            out_direction = directions.EAST
        }
        else if(mirror_direction === directions.WEST){
            context = beam_context.LEFT_UP;
            out_direction = directions.WEST;
        }
        else if(mirror_direction === directions.SOUTH){
            context = beam_context.DOWN_MIR_VERT_BEAM;
        }
        else if(mirror_direction === directions.EAST){
            context = beam_context.RIGHT_MIR_VERT_BEAM;
        }
    }
    else if (in_direction === directions.EAST){
        if (mirror_direction === directions.WEST){
            context = beam_context.LEFT_UP;
            out_direction = directions.NORTH;
        }
        else if (mirror_direction === directions.SOUTH){
            context = beam_context.LEFT_DOWN;
            out_direction = directions.SOUTH;
        }
        else if (mirror_direction === directions.EAST){
            context = beam_context.RIGHT_MIR_HOR_BEAM;
        }
        else if (mirror_direction === directions.NORTH){
            context = beam_context.UP_MIR_HOR_BEAM;
        }

    }
    else if (in_direction === directions.NORTH){
        if (mirror_direction === directions.SOUTH){
            context = beam_context.LEFT_DOWN;
            out_direction = directions.WEST;
        }
        else if (mirror_direction === directions.EAST){
            context = beam_context.RIGHT_DOWN;
            out_direction = directions.EAST;
        }
        else if (mirror_direction === directions.NORTH){
            context = beam_context.UP_MIR_VERT_BEAM;
        }
        else if (mirror_direction === directions.WEST){
            context = beam_context.LEFT_MIR_VERT_BEAM;
        }

    }
    else if (in_direction === directions.WEST){
        if (mirror_direction === directions.EAST){
            context = beam_context.RIGHT_DOWN;
            out_direction = directions.SOUTH;
        }
        else if (mirror_direction === directions.NORTH){
            context = beam_context.RIGHT_UP;
            out_direction = directions.NORTH;
        }
        else if (mirror_direction === directions.WEST){
            context = beam_context.LEFT_MIR_HOR_BEAM;
        }
        else if (mirror_direction === directions.SOUTH){
            context = beam_context.DOWN_MIR_HOR_BEAM;
        }
    }

    return [context, out_direction];
}

function getNextLocation(x, y, direction) {
    var ret_x, ret_y;
    if (direction === directions.NORTH){
        ret_x = x;
        ret_y = y - 1;
    }else if (direction === directions.SOUTH){
        ret_x = x;
        ret_y = y + 1;
    }else if (direction === directions.WEST){
        ret_x = x - 1;
        ret_y = y;
    }else if (direction === directions.EAST){
        ret_x = x + 1;
        ret_y = y;
    }

    return [ret_x, ret_y];
}

function isSameLocation(x1, y1, x2, y2){
    return ((x1 === x2) && (y1 === y2));
}

class Node{
    constructor(id, mapid,  parent, direction) {
        this.event_id = id;
        this.map_id = mapid;
        this.parent = parent;
        this.child = null;
        this.direction = direction;
        $gameMap._events[this.event_id].setDirection(direction);
    }

    getRoot(){
        var node = this;
        while(node.parent !== null){
            node = node.parent;
        }
        return node;
    }

    getNewBeam(x, y, direction){
        Galv.SPAWN.event(getDirectionTileId(direction),x,y,false);
        var events = $gameMap.eventsXy(x,y);
        var event_id = events.pop().eventId();

        var new_beam = new Beam(event_id, this.map_id, this, direction);
        this.addChild(new_beam);
        this.child.drawBeam();
    }

    getNewPlayerBeam(x, y, in_direction, player_direction){
        var context = getPlayerBeamContext(in_direction, player_direction);
        var blocked_beam_id = getRedLaserTileId(context);
        Galv.SPAWN.event(blocked_beam_id, x, y,false);
        var events = $gameMap.eventsXy(x,y);
        var event_id = events.pop().eventId();

        var new_beam;
        new_beam = new Beam(event_id, this.map_id, this, player_direction);
        this.addChild(new_beam);
        new_beam.addChild(null);
    }

    getNewMirrowBeam(x, y, in_direction, mirror_direction){
        var [context, out_direction] = getBeamContext(this.direction, mirror_direction);

        var elbow_id = getMirrorTileId(context);
        Galv.SPAWN.event(elbow_id, x, y,false);
        var events = $gameMap.eventsXy(x,y);
        var event_id = events.pop().eventId();

        var new_beam;
        if (out_direction){
            new_beam = new Beam(event_id, this.map_id, this, out_direction);
            this.addChild(new_beam);
            this.child.drawBeam();
        }
        else{
            new_beam = new Beam(event_id, this.map_id, this, in_direction);
            this.addChild(new_beam);
        }
    }

    getMyNextLocation(){
        var [x, y] = this.getLocation();
        var [ret_x, ret_y] = getNextLocation(x, y, this.direction);

        return [ret_x, ret_y];
    }

    addChild(child){
        this.child = child;
    }

    getLocation(){
        return [$gameMap._events[this.event_id]._realX, $gameMap._events[this.event_id]._realY];
    }

    removeChild(){
        if(this.child !== null){
            Galv.SPAWN.unspawn($gameMap._events[this.child.event_id]);
            this.child.removeChild();
            this.child = null;
        }
    }

    drawBeam(){
        var x, y;
        [x, y] = this.getMyNextLocation();

        var player_x = $gameVariables.value(constants.PlayerX);
        var player_y = $gameVariables.value(constants.PlayerY);
        if (isSameLocation(player_x, player_y, x, y)){
            this.getRoot().blocked = this;
            this.getNewPlayerBeam(x, y, this.direction, $gamePlayer.direction());
            return;
        }

        var event = $gameMap.eventIdXy(x,y);
        var receiver = null;
        var event_obj;

        if (event && !$gameMap._events[event].isSpawnEvent){
            var name = $dataMap.events[event].name;
            if(name.startsWith("MIR")){
                event_obj = $gameMap._events[event];
                var mirror_direction = event_obj.direction();

                this.getNewMirrowBeam(x, y, this.direction, mirror_direction);
                return;
            }
            else if (name.startsWith("RCV")){
                receiver = this.getRoot().getReceiver(event);
                $gameSwitches.setValue(receiver.switch_id, true);
                return;
            }
        }

        if($gameMap.isPassable(x, y, this.direction)){
            this.getNewBeam(x, y, this.direction);
        }
    }
}


class Beam extends Node{
    constructor(id, mapid, parent, direction){
        super(id, mapid,  parent, direction);
        this.rank = parent.rank + 1;
    }
}


class LaserGenerator extends Node{
    constructor(id, mapid, direction, switch_id) {
        super(id, mapid, null, direction);
        this.receivers = [];
        this.switch_id = switch_id
        this.active = false;
        this.blocked = null;
        this.rank = 0;
    }

    getFirstBeam(events){
        var beam = null;
        var rank = Infinity;
        for(var i = 0; i < events.length; i++){
            var node = this.getBeam(events[i].eventId());
            if (node !== null) {
                if(node.rank < rank){
                    beam = node;
                    rank = beam.rank;
                }
            }
        }
        return beam;

    }

    getBeam(event_id){
        var node = this.child;
        while(node !== null){
            if(node.event_id === event_id){
                return node;
            }
            node = node.child;
        }
        return null;
    }

    addReceiver(receiver_id){
        this.receivers.push(receiver_id);
    }

    removeReceiver(receiver_id){
        var pos = this.receivers.indexOf(receiver_id);
        this.receivers.splice(pos, 1);
    }

    getReceiver(receiver_id){
        var receiver = null;
        for(var i=0; i < this.receivers.length; i++){
            if(this.receivers[i].event_id === receiver_id){
                return this.receivers[i];
            }
        }
    }

    turnOn(){
        this.active = true;

        this.drawBeam();
    }

    turnOff(){
        this.active = false;

        this.removeBeam();
    }

    update(){
        if(this.active){
            this.turnOff();
            this.blocked = null;
            this.turnOn();
        }
    }

    updateMirror(x, y){
        var events = $gameMap.eventsXy(x,y);

        if(events.length > 1){
            var mirror_event;
            var laser_events = [];
            for(var i=0; i < events.length; i++){
                if(events[i].isSpawnEvent){
                    if(isLaserTile(events[i]._spawnEventId)){
                        laser_events.push(events[i]);
                    }
                }
                else{
                    var name = $dataMap.events[events[i].eventId()].name;
                    if(name.startsWith("MIR")){
                        mirror_event = events[i];
                    }
                }
            }

            var beam = this.getFirstBeam(laser_events);

            var beam_parent = beam.parent;
            beam_parent.removeChild();
            this.blocked = null;
            beam_parent.drawBeam();
        }

    }

    updatePushMirror(previous_x, previous_y, x, y){
        var events = $gameMap.eventsXy(x,y);

        if(events.length > 1){
            var mirror_event;
            var laser_events = [];
            for(var i=0; i < events.length; i++){
                if(events[i].isSpawnEvent){
                    if(isLaserTile(events[i]._spawnEventId)){
                        laser_events.push(events[i]);
                    }
                }
                else{
                    var name = $dataMap.events[events[i].eventId()].name;
                    if(name.startsWith("MIR")){
                        mirror_event = events[i];
                    }
                }
            }

            var beam = this.getFirstBeam(laser_events);

            var beam_parent = beam.parent;
            beam_parent.removeChild();
            this.blocked = null;
            beam_parent.drawBeam();
        }
        else{
            events = $gameMap.eventsXy(previous_x, previous_y);
            if(events.length > 0){
                for(var i=0; i < events.length; i++){
                    if(events[i].isSpawnEvent){
                        if(isLaserTile(events[i]._spawnEventId)){
                            laser_events.push(events[i]);
                        }
                    }
                    else{
                        var name = $dataMap.events[events[i].eventId()].name;
                        if(name.startsWith("MIR")){
                            mirror_event = events[i];
                        }
                    }
                }

                var beam = this.getFirstBeam(laser_events);
                var beam_parent = beam.parent;
                beam_parent.removeChild();
                this.blocked = null;
                beam_parent.drawBeam();
            }
        }
    }

    updatePlayer(x, y){
        var events = $gameMap.eventsXy(x,y);

        if(events.length > 0){
            var laser_events = [];
            var is_laser = false;
            for(var i=0; i < events.length; i++){
                if(events[i].isSpawnEvent){
                    if(isLaserTile(events[i]._spawnEventId)){
                        laser_events.push(events[i]);
                        is_laser = true;
                    }
                }
            }

            var beam = this.getFirstBeam(laser_events);
            if(is_laser) {
                this.blocked = beam.parent;
                this.blocked.removeChild();
                this.blocked.getNewPlayerBeam(x, y, this.blocked.direction, $gamePlayer.direction());
            }

        }
        else if(this.blocked !== null){
            var blocked = this.blocked;
            blocked.removeChild();
            this.blocked = null;
            blocked.drawBeam();
        }
    }

    removeBeam(){
        this.removeChild();
    }
}

class LaserList extends Array{

    addLaser(laser_generator){
        this.push(laser_generator);
    }

    removeLaser(laser_id){
        var pos = this.indexOf(laser_id);
        this.splice(pos, 1);
    }

    getLaser(event_id){
        for (var i = 0; i < this.length; i++){
            if (this[i].event_id === event_id){
                return this[i];
            }
        }
        return null;
    }
}

class LaserReceiver{
    constructor(event_id, switch_id){
        this.event_id = event_id;
        this.switch_id = switch_id;
    }
}


var laser_generators = new LaserList();
var lg;
