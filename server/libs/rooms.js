// [{
//     id: "15968732485747",
//     game: 'ttt',
//     open: true,
//     private: false,
//     users: [],
//     userIds: []
// }]

/*
addRoom: {
        id: "15968732485747",
        game: 'ttt',
        privateCode: null
}
*/


const {isRealString} = require('./validation');

class Rooms {
    constructor(){
        this.rooms = [];
    }

    //create a new room
    addRoom(addRoom, callback){

            let curRoom = this.rooms.filter((room) => addRoom.id === room.id);
            //if room exists
            if(curRoom.length > 0){
                return callback();
            }else {
                let newRoom = {
                        id: addRoom.id,
                        game: addRoom.game,
                        open: !addRoom.private,
                        private: addRoom.private,
                        users: addRoom.users,
                        userIds: addRoom.userIds
                }
                this.rooms.push(newRoom);
                return newRoom;    
            }     
    }
    
    //remove user and return removed user by id
    removeFromRoom(id){
        const curRoom = this.rooms.filter((room) => id === room.id);
        //if room exists
        if(curRoom.length > 0){
            //lower user count
            curRoom[0].userCount--;
            //if count is at zero remove the room
            if(curRoom[0].userCount <= 0){
                this.rooms = this.rooms.filter((room) => room.id != id);
                return false;
            }
            return true;
        }else{
            return undefined; //cannot remove user from room that does not exist
        }
    }
    //removes a room entirely
    removeRoom(id){
      this.rooms = this.rooms.filter((room) => room.id != id)
    }

    //get all active rooms
    getCurrentRooms(){
        return this.rooms;
    }
    //gets a room by the room id
    getSpecificRoom(id){
      return this.rooms.filter((room) => room.id === id)[0];
    }
    //gets a room if it includes a user(by id)
    getSpecificRoomByUserId(userId){
      return this.rooms.filter((room) => 
        room.userIds.filter((id) => id === userId).length > 0 )[0];
    }

    //get active room that has open space
    getOpenRoom(){
        //get all open rooms
        const openRooms = this.rooms.filter((room) => room.open === true);
        if(openRooms.length === 0) return false;
        //randomly choose a room from the list
        const rnd = Math.floor(Math.random() * openRooms.length);
        const selectedOpenRoom = openRooms[(rnd == 1) ? openRooms.length - 1 : rnd];
        //return the selected open room
        return {
          id: selectedOpenRoom.id, 
          users: selectedOpenRoom.users,
          closeRoom:(open = true) => {
          openRooms.map(room => {
            if(room.id == selectedOpenRoom.id){
              room.open = !open;
            }
          });
        }}; 
    }
    
    //get private room by id
    getPrivateRoom(key, callback){
        //get private room
        const privateRoom = this.rooms.filter((room) => room.id === key);
        //if room exists and is open return access true, else false
        if(privateRoom.length > 0 && privateRoom.open){
            return callback(true);
        }else{
            return callback(false);
        }
    }


}

module.exports = {Rooms};