// direction enum representing the cardinal directions in RPG Maker (based off numpad keys)
const directions = {
    NORTH: 8,
    EAST: 6,
    SOUTH: 2,
    WEST: 4
};

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
    Laser: 11,
    Receiver: 12,
    LaserDirection: 13,
    LocalVar: 8,
    LocalVar2: 15,
    MapId: 16,
    SwitchId: 17
};

var laser_tile_ids = [constants.RedVerticalLaser, constants.RedHorizontalLaser];

function getDirectionTileId(direction){
    if (direction === directions.NORTH || direction === directions.SOUTH){
        return constants.RedVerticalLaser;
    }
    else{
        return constants.RedHorizontalLaser;
    }
}

function getElbowDirectionTileId(direction1, direction2){
    if((direction1 === directions.EAST) && (direction2 === directions.SOUTH) ||
        (direction1 === directions.NORTH) && (direction2 === directions.WEST)){
        return constants.RedLeftDownLaser;
    }
    else if ((direction1 === directions.EAST) && (direction2 === directions.NORTH) ||
        (direction1 === directions.SOUTH) && (direction2 === directions.WEST)){
        return constants.RedLeftUpLaser;
    }
    else if ((direction1 === directions.NORTH) && (direction2 === directions.EAST) ||
        (direction1 === directions.WEST) && (direction2 === directions.SOUTH)){
        return constants.RedRightDownLaser;
    }
    else if ((direction1 === directions.SOUTH) && (direction2 === directions.EAST) ||
        (direction1 === directions.WEST) && (direction2 === directions.NORTH)){
        return constants.RedRightUpLaser;
    }
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

function isLaserTile(x, y){
    var is_laser = false;
    var event_id = $gameMap.eventIdXy(x,y);
    if (event_id) {
        var event = $gameMap._events[event_id];
        console.log(event);
        if(event.isSpawnEvent){
            if(laser_tile_ids.contains(event._spawnEventId)){
                is_laser = true;
            }
        }
    }
    return is_laser;
}

function getNextLocation(x, y, direction) {
    // console.log("getting next location");
    // console.log("x: "+x);
    // console.log("y: "+y);
    // console.log("dir: "+direction);
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
    // console.log("ret x: "+ret_x +" rety y: "+ret_y);
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
        var event_id = $gameMap.eventIdXy(x,y);
        // console.log("New laser event created, id: "+event_id);
        var new_beam = new Beam(event_id, this.map_id, this, direction);
        this.addChild(new_beam);
        this.child.drawBeam();
    }

    getNewElbowBeam(x, y, direction1, direction2){
        Galv.SPAWN.event(getElbowDirectionTileId(direction1, direction2),x,y,false);
        var event_id = $gameMap.eventIdXy(x,y);
        var new_beam = new Beam(event_id, this.map_id, this, direction2);
        this.addChild(new_beam);
        this.child.drawBeam();
    }

    getMyNextLocation(){
        var [x, y] = this.getLocation();
        // console.log("current location, x: " + x + " y: " + y);
        var [ret_x, ret_y] = getNextLocation(x, y, this.direction);
        // if (this.direction === directions.NORTH){
        //     ret_x = x;
        //     ret_y = y - 1;
        // }else if (this.direction === directions.SOUTH){
        //     ret_x = x;
        //     ret_y = y + 1;
        // }else if (this.direction === directions.WEST){
        //     ret_x = x - 1;
        //     ret_y = y;
        // }else if (this.direction === directions.EAST){
        //     ret_x = x + 1;
        //     ret_y = y;
        // }

        return [ret_x, ret_y];
    }

    addChild(child){
        this.child = child;
    }

    getLocation(){
        return [$gameMap._events[this.event_id]._realX, $gameMap._events[this.event_id]._realY];
    }

    removeChild(){
        // console.log("removing child: "+ this.child);
        // console.log("despawning event: "+this.event_id);
        Galv.SPAWN.unspawn($gameMap._events[this.event_id]);
        if(this.child != null){
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
            this.addChild(null);
            this.getRoot().blocked = true;
            return;
        }
        // console.log("player x: ["+player_x+"] player y: ["+player_y+"] next x: ["+x+"] next y: ["+y+"]");
        // if ((player_x === x) && (player_y === y)){
        //     return;
        // }

        // console.log("Next location, x: "+ x + " y: "+ y);
        // TODO: implement checking if the next location has a mirror (issue# 7)
        // var events = $gameMap.eventsXy(x, y);
        var event = $gameMap.eventIdXy(x,y);
        // console.log(event);
        var mirror_flag = false;
        var receiver = null;
        var event_obj;

        if (event){
            // console.log($dataMap.events[event].name);
            // console.log($dataMap.events[event]);
            var name = $dataMap.events[event].name;
            if(name.startsWith("MIR")){
                event_obj = $gameMap._events[event];
                mirror_flag = true;
            }
            else if (name.startsWith("RCV")){
                // event_obj = $gameMap._events[event];
                // rcv_id = true;
                receiver = this.getRoot().getReceiver(event);
            }
        }
        // for (var i = 0; i < events.length; i++){
        //     console.log("event name: "+ events[i].characterName());
        //     console.log($dataMap.events[i].name);
        //     console.log(events[i]);
        //     if (events[i].characterName().startsWith("MIR")){
        //         console.log("mirror found!");
        //         mirror = events[i];
        //         break;
        //     }
        // }

        if(mirror_flag){
            // The next location has a mirror
            // TODO: implement getting mirror direction (depends on implementation of the mirror event)
            //      this section will likely change - this is essentially written as pseudo-code (issue# 7)
            // console.log("Mirror:");
            // console.log(event_obj);
            var mirror_direction = event_obj.direction();
            // console.log("Mirror facing: "+mirror_direction);
            var reflection_direction = getReflection(this.direction, mirror_direction);
            // console.log("reflected direction: " + reflection_direction);
            // var [reflection_x, reflection_y] = getNextLocation(x, y, reflection_direction);
            // console.log("location for reflected beam to be placed, x: " + reflection_x + " y: " + reflection_y);
            // if(isSameLocation(player_x, player_y, reflection_x, reflection_y)){
            //     this.addChild(null);
            //     this.getRoot().blocked = true;
            //     return;
            // }

            if (reflection_direction !== 0){
                this.getNewElbowBeam(x, y, this.direction, reflection_direction);
            }
        }
        else if($gameMap.isPassable(x, y, this.direction)){
            // The next location is passable
            // TODO: implement beam spawning (return type: class Beam) (issue# 8)
            // console.log("location is passable!");
            this.getNewBeam(x, y, this.direction);
        }
        else{
            // not a mirror, and not passable
            // do nothing
            if (receiver){
                // console.log("Found receiver!");
                // console.log(event_obj);
                $gameSwitches.setValue(receiver.switch_id, true);
            }
            else{
                // console.log("location is not passable!");
            }
        }
    }
}


class Beam extends Node{
    constructor(id, mapid, parent, direction){
        super(id, mapid,  parent, direction);
    }
}


class LaserGenerator extends Node{
    constructor(id, mapid, direction, switch_id) {
        super(id, mapid, null, direction);
        this.receivers = [];
        // this.rcv_id = rcv_switch_id;
        this.switch_id = switch_id
        this.active = false;
        this.blocked = null;
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
        // console.log("Laser is turned on.");

        this.drawBeam();
        // console.log("beam drawn, this child: "+this.child);
        // var ch = this.child;
        // while(ch !== null){
        //     console.log("child!: ");
        //     console.log(ch);
        //     ch = ch.child;
        // }
        // console.log("Laser on complete.");
    }

    turnOff(){
        this.active = false;
        // console.log("Laser is turning off.");
        // console.log("this child: "+this.child);

        this.removeBeam();
        // console.log("Laser off complete.");
    }

    update(){
        if(this.active){
            this.turnOff();
            this.turnOn();
        }
    }

    updatePlayer(x, y, direction){
        var is_laser = false;
        var event = null;
        var event_id = $gameMap.eventIdXy(x,y);
        if (event_id) {
            event = $gameMap._events[event_id];
            console.log(event);
            if(event.isSpawnEvent){
                if(laser_tile_ids.contains(event._spawnEventId)){
                    is_laser = true;
                }
            }
        }


        if(is_laser){
            this.blocked = this.getBeam(event_id);
            this.blocke
        }
        else if(this.blocked){
            if(this.blocked === direction){

            }
            else{
                this.blocked = null;
            }
            this.update();

        }
    }

    removeBeam(){
        // console.log("removing beam, laser beam child: ")
        // console.log(this.child);
        if(this.child !== null){
            this.child.removeChild();
        }
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
        // console.log("getting laser with id: "+event_id);
        for (var i = 0; i < this.length; i++){
            // console.log("laser:");
            // console.log(this[i]);
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