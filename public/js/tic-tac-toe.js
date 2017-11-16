


function ticTacToeGame() {



    ///////Socket incoming messages - START/////
    socket.on('ttt-join-game', function(res){
      curRoom = res.room;
      $('#versus-text').text(username + ' vs. ' + (res.user || '(WAITING)'));
      console.log(res.first);
      init(res.first);
    });

    socket.on('ttt-new-game', function(res){
      curRoom = res.room;
      $('#versus-text').text(username + ' vs. ' + '(WAITING)');
    });

    socket.on('player-moved-ttt', function(pos, context){
      OpponentHandler(pos);
    });

    ///////Socket incoming messages - END/////




    // Elements
    var game = document.getElementById('tic-tac-toe-board');
    var boxes = document.querySelectorAll('li');
    var resetGame = document.getElementById('reset-game');
    var turnDisplay = document.getElementById('whos-turn');
    var gameMessages = document.getElementById('game-messages');
    
    // Vars
    var context = { 'player1' : 'x', 'player2' : 'o' };
    var board = [];
    
    var playerOneScore = 0;
    var playerTwoScore = 0;
    
    var turns;
    var currentContext;
    var clickedBoxes = [];

    AbleToBoxClick = (canClick) => {
      if(canClick) {
        boxes.forEach((box) => {
          if(!(clickedBoxes.indexOf(box) > -1))
            box.addEventListener('click', clickHandler, false);
          }) 
      }else {
        boxes.forEach((box) => {
          if(!(clickedBoxes.indexOf(box) > -1))
            box.removeEventListener('click', clickHandler);
          }) 
      }
    }
    
    // Constructor
    var init = function(clickable) {
        turns = 0;
        
        // Get current context
        currentContext = computeContext();
        
        // Setup 3 x 3 board 
        board[0] = new Array(3);
        board[1] = new Array(3);
        board[2] = new Array(3);
        
        // bind events
        if(clickable) AbleToBoxClick(true);
        
        resetGame.addEventListener('click', resetGameHandler, false);
    }
    
    //Keeps track of player's turn
    var computeContext = function() {
        return (turns % 2 == 0) ? context.player1 : context.player2;
    }
    
    // Bind the dom element to the click callback
    var clickHandler = function() {
      
        this.removeEventListener('click', clickHandler);
        
          this.className = currentContext;
          this.innerHTML = currentContext;
          
          var pos = this.getAttribute('data-pos').split(',');
          const Box = document.querySelector(`[data-pos='${pos}']`)
          board[pos[0]][pos[1]] = computeContext() == 'x' ? 1 : 0;

          clickedBoxes.push(Box);
          
          socket.emit('player-move-ttt', curRoom, pos);

          
          if(checkStatus()) {
              gameWon();
          }
          
          turns++;
          AbleToBoxClick(false);
          currentContext = computeContext();
          turnDisplay.className = currentContext;     
    }

        // Bind the dom element to the opponent move
        var OpponentHandler = function(newPos) {
          const Box = document.querySelector(`[data-pos='${newPos}']`)
          clickedBoxes.push(Box);
          
          Box.removeEventListener('click', clickHandler);
            
          Box.className = currentContext;
          Box.innerHTML = currentContext;
              
              board[newPos[0]][newPos[1]] = computeContext() == 'x' ? 1 : 0;
              
              if(checkStatus()) {
                  gameWon();
              }
              
              turns++;
              AbleToBoxClick(true);
              currentContext = computeContext();
              turnDisplay.className = currentContext;     
        }
    
    
    // Check to see if player has won
    var checkStatus = function() {
        var used_boxes = 0;
        
        for(var rows = 0; rows < board.length; rows++ ) {
            var row_total = 0;
            var column_total = 0;
            
            for(var columns = 0; columns < board[rows].length; columns++) {
                row_total += board[rows][columns];
                column_total += board[columns][rows];
                
                if(typeof board[rows][columns] !== "undefined") {
                    used_boxes++;
                }
            }
            
            // Winning combination for diagonal scenario [0,4,8], [2,4,6]
            var diagonal_tl_br = board[0][0] + board[1][1] + board[2][2]; // diagonal top left to bottom right
            var diagonal_tr_bl = board[0][2] + board[1][1] + board[2][0]; // diagonal top right bottom left
            
            if(diagonal_tl_br == 0 || diagonal_tr_bl == 0 || diagonal_tl_br == 3 || diagonal_tr_bl == 3) {
                return true;
            }
            
            // Winning combination for row [0,1,2], [3,4,5], [6,7,8]
            // Winning combination for column [0,3,6], [1,4,7], [2,5,8]
            // Only way to win is if the total is 0 or if the total is 3. X are worth 1 point and O are worth 0 points
            if(row_total == 0 || column_total == 0 || row_total == 3 || column_total == 3) {
                return true;
            }
            
            // if all boxes are full - Draw!!!
            if(used_boxes == 9) {
                gameDraw();
            }
        }
    }
    var gameWon = function() {
        AbleToBoxClick(false);
        
        // show game won message
        gameMessages.className = 'player-' + computeContext() + '-win';
        
        // update the player score
        switch(computeContext()) {
            case 'x':
                playerOneScoreCard.innerHTML = ++playerOneScore;
                break;
            case 'o':
                playerTwoScoreCard.innerHTML = ++playerTwoScore;
        }
    }
    // Tells user when game is a draw.
    var gameDraw = function() {
        gameMessages.className = 'draw';
        AbleToBoxClick(false);
    }
    
    // Reset game to play again  //TODO: This breaks the turn system, fix it
    var resetGameHandler = function() {
        clickedBoxes = [];
        AbleToBoxClick(false);
        init(true);
        
        // Go over all the li nodes and remove className of either x,o
        // clear out innerHTML
        for(var i = 0; i < boxes.length; i++) {
            boxes[i].className = '';
            boxes[i].innerHTML = '';
        }
        
        // Change Who's turn class back to player1
        turnDisplay.className = currentContext;
        gameMessages.className = '';
    }
    
    //game && init();
}