// direction enum representing the cardinal directions in RPG Maker (based off numpad keys)
const directions = {
    NORTH: 8,
    EAST: 6,
    SOUTH: 2,
    WEST: 4
};

function getDirectionTileId(direction){
    if (direction === directions.NORTH || direction === directions.SOUTH){
        return 1;
    }
    else{
        return 2;
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

function getNextLocation(x, y, direction) {
    console.log("getting next location");
    console.log("x: "+x);
    console.log("y: "+y);
    console.log("dir: "+direction);
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

class Node{
    constructor(id, mapid,  parent, direction) {
        this.event_id = id;
        this.map_id = mapid;
        this.parent = parent;
        this.child = null;
        this.direction = direction;
        $gameMap._events[this.event_id].setDirection(direction);
    }

    getNewBeam(x, y, direction){
        Galv.SPAWN.event(getDirectionTileId(direction),x,y,true);
        var event_id = $gameMap.eventIdXy(x,y);
        var new_beam = new Beam(event_id, this.map_id, this, direction);
        this.addChild(new_beam);
        this.child.drawBeam();
    }

    getMyNextLocation(){
        var [x, y] = this.getLocation();
        console.log("current location, x: " + x + " y: " + y);
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
        if(this.child != null){
            this.child.removeChild();
            this.child = null;
        }
    }

    drawBeam(){
        var x, y;
        [x, y] = this.getMyNextLocation();
        console.log("Next location, x: "+ x + " y: "+ y);
        // TODO: implement checking if the next location has a mirror (issue# 7)
        // var events = $gameMap.eventsXy(x, y);
        var event = $gameMap.eventIdXy(x,y);
        console.log(event);
        var mirror_flag = false;

        var mirror;

        if (event){
            console.log($dataMap.events[event].name);
            console.log($dataMap.events[event]);
            if($dataMap.events[event].name.startsWith("MIR")){
                mirror = $gameMap._events[event];
                mirror_flag = true;
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
            console.log("Mirror:");
            console.log(mirror);
            var mirror_direction = mirror.direction();
            console.log("Mirror facing: "+mirror_direction);
            var reflection_direction = getReflection(this.direction, mirror_direction);
            console.log("reflected direction: " + reflection_direction);
            var [reflection_x, reflection_y] = getNextLocation(x, y, reflection_direction)
            console.log("location for reflected beam to be placed, x: " + reflection_x + " y: " + reflection_y);


            if (reflection_direction !== 0){
                this.getNewBeam(reflection_x, reflection_y, reflection_direction);
            }
        }
        else if($gameMap.isPassable(x, y, this.direction)){
            // The next location is passable
            // TODO: implement beam spawning (return type: class Beam) (issue# 8)
            console.log("location is passable!");
            this.getNewBeam(x, y, this.direction);
        }
        else{
            // not a mirror, and not passable
            // do nothing
            console.log("location is not passable!");
        }
    }
}


class Beam extends Node{
    constructor(id, mapid, parent, direction){
        super(id, mapid,  parent, direction);
    }
}


class LaserGenerator extends Node{
    constructor(id, mapid, direction) {
        super(id, mapid, null, direction);
        this.active = false;
    }

    turnOn(){
        this.active = true;
        console.log("Laser is turned on.");

        this.drawBeam()
    }

    turnOff(){
        this.active = false;
        this.removeBeam();
    }

    removeBeam(){
        this.removeChild();
    }
}