//fire the function immediately after the window loads
window.onload = function init() {
  var game = new GF();
  game.start();
}

// game framework starts here 
var GF = function (){
  //vars related to the canvas
  var canvas,ctx,w,h;
  //vars used for counting frames/s and used by measureFPS function
  var frameCount = 0;
  var lastTime;
  var fpsContainer;
  var fps;
  //for the time based animation
  var delta, oldTime = 0;

  //var for handling inputs
  var inputStates = {};

  //the monster!
  var monster = {
    x:10,
    y:10,
    speed:100, //pixels/s this time!
  };

  var ballArray = [];

  /*we want the monster to move at speed pixels/s (there are 60 frames in a second) 
  if we are really moving 60 frames/s, the delay between each frames would be 1/60th of a second = 16.66ms
  so the number of pixels to move = (speed * delta)/1000.
  If the delay is twice longer, the formula works : let's move the rectangle twice longer!
  */
  var calcDistanceToMove = function(delta,speed) {
    //console.log("#delta = " + delta + " speed = " + speed);
    return (speed*delta)/1000;
  };
  
  var measureFPS = function(newTime){
    //test for every invocation
    if(lastTime === undefined){
      lastTime = newTime;
      return;
    }

    //calculate the difference between last and the current frame
    var diffTime = newTime - lastTime;

    if (diffTime >= 1000){
      fps = frameCount;
      frameCount = 0;
      lastTime = newTime;
    }

    //append it to the document to the document in the start() function 
    fpsContainer.innerHTML = 'FPS: ' +fps;
    frameCount++; 
  };

  // clear the canvas content 
  function clearCanvas(){
    ctx.clearRect(0,0,w,h);

  }

  //function for drawing the monster and may be other objects
  function drawMonster(x,y){
    //draw the big monster's head
    //we have to follow best practice for that
    //but save the context first
    ctx.save();

    //translate the coordinate system, relative to it
    ctx.translate(x,y);

    //0,0 is the top left corner of the monster 
    ctx.strokeRect(0,0,100,100);

    //eyes 
    ctx.fillRect(20, 20, 10, 10);
    ctx.fillRect(65, 20, 10, 10);

    // nose
    ctx.strokeRect(45, 40, 10, 40);
  
    // mouth
    ctx.strokeRect(35, 84, 30, 10);

    // teeth
    ctx.fillRect(38, 84, 10, 10);
    ctx.fillRect(52, 84, 10, 10);

    //restore
    ctx.restore();
  }

  function timer(currentTime) {
    var delta = currentTime - oldTime;
    oldTime = currentTime;
    return delta;
  }

  var mainloop = function (time){
    //main function, called each frame
    measureFPS(time);

    //number of ms since the last frame draw
    delta = timer(time);

    //clear canvas
    clearCanvas();

    //draw the monster 
    drawMonster(monster.x, monster.y);

    // check inputs and move the monster
    updateMonsterPosition(delta);

    //update and draw balls

    updateBalls(delta);

    //call the animation loop every 1/60th of a second
    
    requestAnimationFrame(mainloop);

  }

  function updateMonsterPosition(delta){
    monster.speedX = monster.speedY = 0;
    // check inputStates
    if (inputStates.left){
      monster.speedX = -monster.speed;
    }

    if (inputStates.up){
      monster.speedY = -monster.speed;
    }

    if (inputStates.right){
      monster.speedX = monster.speed;
    }

    if (inputStates.down){
      monster.speedY = monster.speed;
    }

    if (inputStates.space){
      
    }

    if (inputStates.mousePos){
      
    }

    if (inputStates.mousedown){
      monster.speed = 500;
    } else {
      //mouse up 
      monster.speed = 100;
    }
    
    monster.x += calcDistanceToMove(delta, monster.speedX);
    monster.y += calcDistanceToMove(delta, monster.speedY);
    

  }


  function updateBalls(delta){
    // for each ball in the array
    for(var i=0; i<ballArray.length; i++){
      var ball = ballArray[i];

      //1) move the ball
      ball.move();

      //2) test if the ball collides with the wall
      testCollisionWithWalls(ball);

      //3) draw the ball 
      ball.draw();
    }
  }

  function testCollisionWithWalls(ball){
    //left 
    if (ball.x < ball.radius) {
      ball.x = ball.radius;
      ball.angle = -ball.angle + Math.PI;
    }

    //right 
    if (ball.x > w - (ball.radius)) {
      ball.x = w - (ball.radius);
      ball.angle = - ball.angle + Math.PI;
    }

    //up 
    if (ball.y < ball.radius) {
      ball.y = ball.radius;
      ball.angle = -ball.angle;

    }

    //down
    if (ball.y > h - (ball.radius)){
      ball.y = h - (ball.radius);
      ball.angle = -ball.angle;  
    }
  }

  function getMousePos(evt){
    //necessary to take into account CSS boundaries
    var rect = canvas.getBoundingClientRect();
    return{
      x: evt.clientX - rect.left,
      y:evt.clientY - rect.top
    };
  }

  function createBalls(numberOfBalls){
    for (var i = 0; i < numberOfBalls; i++) {
      //Create ball with random numbers and speed
      // you can change the radius 

      var ball = new Ball(w*Math.random(), 
      h*Math.random(),
      (2*Math.PI)*Math.random(),
      (400*Math.random()),
      30);
      
      //we add it to the table 
      ballArray[i] = ball;
    }
  }

  //constructor function for balls 
  function Ball(x, y, angle, v, diameter) {
    this.x = x;
    this.y = y; 
    this.angle = angle;
    this.v = v; 
    this.radius = diameter/2;

    this.draw = function(){
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
      ctx.fill();
    };

    this.move = function() { 
      //add horizontal increment to x pos
      //add vertical increment to y pos 

      var incX = this.v * Math.cos(this.angle);
      var incY = this.v * Math.sin(this.angle);

      this.x += calcDistanceToMove(delta, incX);
      this.y += calcDistanceToMove(delta, incY);

    };

  }

  var start = function(){
    // add a div to display the fps value 
    fpsContainer = document.createElement('div');
    document.body.appendChild(fpsContainer);
    
    //canvas, context, etc.
    canvas = document.querySelector("#myCanvas");

    //often useful 
    w = canvas.width;
    h = canvas.height;

    //important: we will draw with this object
    ctx = canvas.getContext('2d');
    ctx.font = " 20px Aerial";
    
    //add an eventListener to the main, window object, and update the states 
    window.addEventListener('keydown', function(event){
      if (event.keyCode === 37){
        inputStates.left = true;
      }else if (event.keyCode === 38){
        inputStates.up = true;
      }else if (event.keyCode === 39){
        inputStates.right = true;
      }else if (event.keyCode === 40){
        inputStates.down = true;
      }else if (event.keyCode === 32) {
        inputStates.space = true;
      }

    }, false);
    
    //if the key will be released, change the state object

    window.addEventListener('keyup', function(event){
      if (event.keyCode === 37){
        inputStates.left = false;
      }else if (event.keyCode === 38){
        inputStates.up = false;
      }else if (event.keyCode === 39){
        inputStates.right = false;
      }else if (event.keyCode === 40){
        inputStates.down = false;
      }else if (event.keyCode === 32) {
        inputStates.space = false;
      }

    }, false);

    //mouse event listeners
    canvas.addEventListener('mousemove', function(evt){
      inputStates.mousePos = getMousePos(evt);
    },false);
    canvas.addEventListener('mousedown', function(evt){
      inputStates.mousedown = true;
      inputStates.mouseButton = evt.button;
    },false);
    
    canvas.addEventListener('mouseup', function(evt){
      inputStates.mousedown = false;
    }, false);

    createBalls(10);

    //start the animation 
    requestAnimationFrame(mainloop);

  };

  //our GameFramework returns an API visible outside its scope

  return {
    start: start
  };

};
