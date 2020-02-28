//=============================================================================
// DL_ProximityBgs.js
//=============================================================================

/*:
 * @plugindesc An extension to allow for multiple event-based background sounds
 * @author Deadlift
 *
 * @help This plugin does not provide plugin commands. There are two main functions
 * that can be called from the target event or by another event by providing the target event id.
 * 
 * This plugin is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 license (https://creativecommons.org/licenses/by-nc-nd/4.0/)
 * 
 * Start a bgs from the target event:
 * 
 * Deadlift.proximityBgs.playBgs(this, 
 * {
 *      name: 'River',
 *      maxVolume: 100, 
 *      minVolume: 25, 
 *      pitch: 100, 
 *      pan: 0, 
 *      distance: 10,
 *      autoPan: true
 * });
 * 
 * name: name of the background sound file. The file has to be in the bgs folder.
 * maxVolume: the volume of the bgs when the player is in closest (0-1 tile) distance to the event.
 * minVolume: the volume of the bgs when the player is further away from the event than the defined distance.
 * pitch: bgs pitch.
 * pan: bgs pan.
 * distance: The distance from the event in which the volume changes from minVolume to maxVolume. 
 * If the distance between the player and the event is greater than the defined distance, the volume will be equal to the defined minVolume.
 * autoPan: automatically adapt the pan to the current position of the player. If autoPan is set to 'true', the plugin will ignore the pan value and instead adjust it automatically.
 * 
 * Start a bgs for a target event from another event by providing the target event ID (in this example event-ID = 4):
 * 
 * Deadlift.proximityBgs.playBgs(4, 
 * {
 *      name: 'River',
 *      maxVolume: 100, 
 *      minVolume: 25, 
 *      pitch: 100, 
 *      pan: 0, 
 *      distance: 10
 * });
 * 
 * Stop a bgs from the target event by only providing the bgs name (bgs name = "River"):
 * 
 * Deadlift.proximityBgs.stopBgs(this, "River");
 * 
 * Stop a bgs for a target event from another event by providing the target event ID (event ID = 4, bgs name = "River"):
 * 
 * Deadlift.proximityBgs.stopBgs(4, "River");
 * 
 * Stop all bgs started by this plugin:
 * 
 * Deadlift.proximityBgs.stopAll();
 */


var Deadlift = Deadlift || {};

Deadlift.proximityBgs = (function() {

    var proximityBgSounds = {};

    var bgsAlreadyExistsForEvent = function(eventId, name) {
        return proximityBgSounds[eventId] && proximityBgSounds[eventId].some(function(s) { return s.name === name});
    }

    var insertBgs = function(eventId, bgsElement) {
        if (bgsAlreadyExistsForEvent(eventId, bgsElement.name)) {
            // adjust parameters
            proximityBgSounds[eventId].forEach(function(targetSound) {
                 if (targetSound.name === bgsElement.name) {
                    targetSound.maxVolume = bgsElement.maxVolume;
                    targetSound.minVolume = bgsElement.minVolume;
                    targetSound.distance = bgsElement.distance;
                    targetSound.pan = bgsElement.pan;
                    targetSound.pitch = bgsElement.pitch;

                    targetSound.buffer.volume = bgsElement.buffer.volume;
                    targetSound.buffer.pitch = bgsElement.buffer.pitch;
                    targetSound.buffer.pan = bgsElement.buffer.pan;
                 }
            });
        } else {
            // insert element
            if (!proximityBgSounds[eventId]) proximityBgSounds[eventId] = [];
            proximityBgSounds[eventId].push(bgsElement);

            bgsElement.buffer.play(true,  0);
        }
    }


    var setProximityValues = function(eventId, soundElement) {
        if (!soundElement || !soundElement.buffer) return;

        //check proximity between player and event
        var event = $gameMap.event(eventId);

        // event does not exist, i.e. map change 
        if (!event) return;

        var dist = $gameMap.distance($gamePlayer.x, $gamePlayer.y, event.x, event.y);

        var range = soundElement.maxVolume - soundElement.minVolume;

        var proximityVolume = Math.max(soundElement.minVolume, (soundElement.maxVolume - ((dist-1) * (range/(Math.max(soundElement.distance-1, 1))))));


        soundElement.buffer.volume = AudioManager.bgsVolume * proximityVolume / 10000;
        soundElement.buffer.pitch = (soundElement.pitch || 0) / 100;
        setPan(event, soundElement);
    }

    var setPan = function(event, soundElement) {
        var pan = 0;
        if (soundElement.autoPan) {
            pan = determineAutoPan(event, soundElement);
        } else {
            pan = (soundElement.pan || 0);
        }
        soundElement.buffer.pan = pan / 100;
    }

    var determineAutoPan = function(event, soundElement) {
        var eventPlayerDistance = getXaxisDistance(event);
        var normalizedDistance = getMaxDistance(eventPlayerDistance, soundElement.distance);
        var unit = 100 / soundElement.distance;
        return normalizedDistance * unit;
    }

    var getMaxDistance = function(eventPlayerDistance, maxSoundDistance) {
        var dist = Math.min(Math.abs(eventPlayerDistance), maxSoundDistance);
        if (eventPlayerDistance < 0) dist = (0-dist);
        return dist;
    }

    var getXaxisDistance = function(event) {
        return event.x - $gamePlayer.x;
    }

    var adjustBgsProximityValues = function(eventId) {
        // call from event movement-event
        var currentSounds = proximityBgSounds[eventId];
        if (!currentSounds || currentSounds.length === 0) return;

        currentSounds.forEach(function(sound) {
            setProximityValues(eventId, sound);
        });
    }

    var adjustProximityBgsEvents = function() {
        // call from player movement-event
        for (var eventId in proximityBgSounds) {
            adjustBgsProximityValues(eventId);
        }
    }

    var removeElement = function(array, determine) {

        var index = null;

        for (var i = 0; i < array.length; ++i) {
            if (determine(array[i])) {
                index = i;
                break;
            } 
        }

        if (index != null) return array.splice(index, 1);
    }

    var stopAllBgs = function() {

        for (var eventId in proximityBgSounds) {
            var currentSounds = proximityBgSounds[eventId];
            currentSounds.forEach(function(sound) { 
                sound.buffer.stop();
            });
        }

        proximityBgSounds = {};
    }

    var adjustProximityBgsVolumeAfterOptionChange = function() {
        for (var eventId in proximityBgSounds) {
            adjustBgsProximityValues(eventId);
        }
    }

    var originalExecuteMove = Game_Player.prototype.executeMove;
    Game_Player.prototype.executeMove = function(direction) {

        originalExecuteMove.call(this, direction);

        adjustProximityBgsEvents();
    }

    var originalGcbMoveStraight = Game_CharacterBase.prototype.moveStraight;
    
    Game_CharacterBase.prototype.moveStraight = function(d) {
        originalGcbMoveStraight.call(this, d);
        if (!this.eventId) return;
        adjustBgsProximityValues(this.eventId());
    }

    var originalToTitle = Scene_GameEnd.prototype.commandToTitle;

    Scene_GameEnd.prototype.commandToTitle = function() {
        // delete proximity bgs when leaving the game
        stopAllBgs();
        originalToTitle.call(this);
    }

    Object.defineProperty(AudioManager, 'bgsVolume', {
        get: function() {
            return this._bgsVolume;
        },
        set: function(value) {
            this._bgsVolume = value;
            // adjust proximity bgs volume
            adjustProximityBgsVolumeAfterOptionChange();
            this.updateBgsParameters(this._currentBgs);
        },
        configurable: true
    });

    var originalMapInitialize = Game_Map.prototype.setup;

    Game_Map.prototype.setup = function(id) {
        originalMapInitialize.call(this, id);
        // delete proximity bgs when changing maps
        stopAllBgs();
    }

    
    return {
        playBgs: function(event, bgs) {
            if (!event || !bgs) return;

            if (bgs.name) {

                var eventId = (!isNaN(event) ? event : event.eventId());
                // add buffer to sound element
                var currentBgsBuffer = AudioManager.createBuffer('bgs', bgs.name);
                bgs.buffer = currentBgsBuffer;

                // calculate parameters (volume)
                setProximityValues(eventId, bgs);

                // add sound element to list
                insertBgs(eventId, bgs);

            }
        }, 

        stopBgs: function(event, name) {
            if (!event || !name) return;
            var eventId = (!isNaN(event) ? event : event.eventId());
            if (!bgsAlreadyExistsForEvent(eventId, name)) return;      
            
            var currentBgs = proximityBgSounds[eventId];
            var removed = removeElement(currentBgs, function(bgsElement) {
                return bgsElement.name === name;
            });

            if (removed) {
                removed.forEach(function(bgs) {
                    bgs.buffer.stop();
                });
            }
            
        },

        stopAll: stopAllBgs
    };

})();