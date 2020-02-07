// direction enum representing the cardinal directions in RPG Maker (based off numpad keys)
const directions = {
    NORTH: 8,
    EAST: 6,
    SOUTH: 2,
    WEST: 4
};


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
        var new_beam = createBeamEvent(x, y, direction);
        this.addChild(new_beam);
        this.child.drawBeam();
    }

    getNextLocation(){
        var [x, y] = this.getLocation();

        var ret_x, ret_y;
        if (this.direction === directions.NORTH){
            ret_x = x;
            ret_y = y - 1;
        }else if (this.direction === directions.SOUTH){
            ret_x = x;
            ret_y = y + 1;
        }else if (this.direction === directions.WEST){
            ret_x = x - 1;
            ret_y = y;
        }else if (this.direction === directions.EAST){
            ret_x = x + 1;
            ret_y = y;
        }
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
        [x, y] = this.getNextLocation();
        // TODO: implement checking if the next location has a mirror (issue# 7)
        if(isMirror(x, y)){
            // The next location has a mirror
            // TODO: implement getting mirror direction (depends on implementation of the mirror event)
            //      this section will likely change - this is essentially written as pseudo-code (issue# 7)
            var mirror_direction = getMirrorDirection(x, y);

            var reflection_direction, reflection_x, reflection_y;
            [reflection_direction, reflection_x, reflection_y]= getReflection(this.direction, mirror_direction, x, y);

            if (reflection_direction != null){
                this.getNewBeam(reflection_x, reflection_y, reflection_direction);
            }
        }
        else if($gameMap.isPassable(x, y, this.direction)){
            // The next location is passable
            // TODO: implement beam spawning (return type: class Beam) (issue# 8)
            this.getNewBeam(x, y, this.direction);
        }
        else{
            // not a mirror, and not passable
            // do nothing
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