window.requestAnimFrame = (function() {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function(callback) {
		window.setTimeout(callback, 1000 / 60);
	};
})();


//设置游戏区域
var canvas = document.getElementById('canvas'),
	ctx = canvas.getContext('2d');

var width = 422,
	height = 552;

canvas.width = width;
canvas.height = height;


//游戏基本参数
var platforms = [],
	doge_image_left = document.getElementById("doge-left"),
	big_doge_image_left = document.getElementById("big-doge-left"),

	doge_image_left_land = document.getElementById("doge-left-land"),
	big_doge_image_left_down = document.getElementById("big-doge-left-down"),

	doge_image_right = document.getElementById("doge-right"),
	big_doge_image_right = document.getElementById("big-doge-right"),

	doge_image_right_land = document.getElementById("doge-right-land"),
	big_doge_image_right_down = document.getElementById("big-doge-right-down"),

  image_left = doge_type==='DOGE!'? big_doge_image_left: doge_image_left,
  image_left_land = doge_type==='DOGE!'? big_doge_image_left_down: doge_image_left_land,
  image_right = doge_type==='DOGE!'? big_doge_image_right: doge_image_right,
  image_right_land = doge_type==='DOGE!'? big_doge_image_right_down: doge_image_right_land,

  doge_size=50,
  big_doge_size=75,
  small_doge_size=30,
  size=doge_size,

  background_image = document.getElementById("background"),
	doge,
  platformCount = 8,
  back,


  jumpSpeed = -6.5,
  moveSpeed = 0.15,

  background_sx = [30,312,594][Math.floor ( Math.random() * 3 )],
  background_sy = 0,



	position = 0,
	gravity = 0.15,
	animloop,
	flag = 0,
	menuloop,
  broken = 0,
	dir,
  score = 0,
  firstRun = true,
  doge_type='doge';


var Background = function() {
  this.x=background_sx;
  this.y=1000;
  this.draw=function(){
    ctx.drawImage(background_image,this.x,this.y,250,250/422*552,0,0,width,height);
    ctx.save();
    ctx.fillStyle = 'rgba(225,225,225,0.5)';
    ctx.fillRect(0,0,width,height);
    ctx.restore();
  };
};

back = new Background();

var Doge = function() {
  this.vy = 11;
  this.vx = 0;

  this.isMovingLeft = false;
  this.isMovingRight = false;
  this.isDead = false;

  if(doge_type==='DOGE!') size=big_doge_size;
  if(doge_type==='Doge') size=doge_size;
  if(doge_type==='Dogiee') size=small_doge_size;

	this.width = size;
	this.height = size;

  this.dir = "left";

	this.x = width / 2 - this.width / 2;
	this.y = height/2;

  //doge block
  var doge_block = document.createElement("canvas");
  var dogectx= doge_block.getContext("2d");


  this.draw = function() {
    image_left = doge_type==='DOGE!'? big_doge_image_left: doge_image_left;
    image_left_land = doge_type==='DOGE!'? big_doge_image_left_down: doge_image_left_land;
    image_right = doge_type==='DOGE!'? big_doge_image_right: doge_image_right;
    image_right_land = doge_type==='DOGE!'? big_doge_image_right_down: doge_image_right_land;
    if(doge_type==='DOGE!') size=big_doge_size;
    if(doge_type==='Doge') size=doge_size;
    if(doge_type==='Dogiee') size=small_doge_size;
    this.width = size;
  	this.height = size;
    // debugger
//doge rotating
doge_block.width = size;
doge_block.height = size;
    dogectx.clearRect(0,0,size,size);
    dogectx.save();
    dogectx.translate(size/2,size/2);
    dogectx.rotate(this.y/50*Math.PI);
    dogectx.translate(-size/2,-size/2);
    // debugger
		try {
			if (this.dir == "right") dogectx.drawImage(image_right,0, 0, size, size);
			else if (this.dir == "left") dogectx.drawImage(image_left,0, 0, size, size);
			else if (this.dir == "right_land") dogectx.drawImage(image_right_land,0, 0, size, size);
			else if (this.dir == "left_land") dogectx.drawImage(image_left_land,0, 0, size, size);

			ctx.drawImage(doge_block, this.x, this.y, this.width, this.height);
		} catch (e) {}
    dogectx.restore();
	};

  this.jump = function(){
    this.vy = jumpSpeed;
  };

  this.superJump = function(){
    this.vy = jumpSpeed*2;
  };

  this.lowJump = function(){
    this.vy = jumpSpeed*0.8;
  };
  this.highJump = function(){
    this.vy = jumpSpeed*1.3;
  };
};

doge = new Doge();

//游戏底部
var Base = function() {
	this.height = 5;
	this.width = width;

	this.moved = 0;

	this.x = 0;
	this.y = height - this.height;

	this.draw = function() {
      ctx.beginPath();
			ctx.rect(this.x, this.y, this.width, this.height);
      ctx.stroke();
      ctx.closePath();
	};
};

var base = new Base();


//平台
function Platform() {
  this.flag = 0;
	this.state = 0;

  if (score >= 5000) this.types = [2, 3, 3, 3, 4, 4, 4, 4];
	else if (score >= 2000 && score < 5000) this.types = [2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4];
	else if (score >= 1000 && score < 2000) this.types = [2, 2, 2, 3, 3, 3, 3, 3];
	else if (score >= 500 && score < 1000) this.types = [1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3];
	else if (score >= 100 && score < 500) this.types = [1, 1, 1, 1, 2, 2];
	else this.types = [1];

  this.type = this.types[Math.floor(Math.random() * this.types.length)];

  if (this.type == 3 && broken < 1) {
		broken++;
	} else if (this.type == 3 && broken >= 1) {
		this.type = 1;
		broken = 0;
	}

	this.width = 70;
	this.height = 17;
  this.angle=Math.random();

	this.x = Math.random() * (width - this.width);
	this.y = position;
  this.cy=position;

	position += (height / platformCount);

	this.draw = function() {
		try {
      ctx.beginPath();
      ctx.save();
      if (this.type == 1) ctx.fillStyle='rgba(170, 240, 101, 0.5)';
			else if (this.type == 2) ctx.fillStyle='rgba(129, 251, 251, 0.5)';
			else if (this.type == 3 && this.flag === 0) ctx.fillStyle='rgba(251, 129, 129, 0.5)';
			else if (this.type == 3 && this.flag == 1) ctx.fillStyle='rgba(22, 3, 3, 0.5)';
			else if (this.type == 4 && this.state === 0) ctx.fillStyle='rgba(255, 255, 255, 0.5)';
			else if (this.type == 4 && this.state == 1) ctx.fillStyle='rgba(255, 255, 255, 0.5)';
      ctx.fillRect(this.x, this.y, this.width, this.height);
			ctx.rect(this.x, this.y, this.width, this.height);
      ctx.stroke();
      ctx.restore();
      ctx.closePath();
		} catch (e) {}
	};



	this.moved = 0;
	this.vx = 1;
}

for (var i = 0; i < platformCount; i++) {
	platforms.push(new Platform());
}


//游戏
function gameinit(){
  var dir = 'left';
  firstRun = false;

  //清除界面
  function paintCanvas() {
		ctx.clearRect(0, 0, width, height);
	}

  //控制doge
  function dogeCalc(){
    if (dir == "left") {
			doge.dir = "left";
			if (doge.vy < -2 && doge.vy > -15) doge.dir = "left_land";
		} else if (dir == "right") {
			doge.dir = "right";
			if (doge.vy < -2 && doge.vy > -15) doge.dir = "right_land";
		}

    document.onkeydown = function(e) {
      var key = e.which;

      if (key == 37) {
        console.log('left');
        dir = "left";
        doge.isMovingLeft = true;
      } else if (key == 39) {
        console.log('right');
        dir = "right";
        doge.isMovingRight = true;
      } else if (key == 32) {
        if(firstRun === true)
					gameinit();
				else
					reset();
      }


    };

    document.onkeyup = function(e) {
			var key = e.keyCode;

			if (key == 37) {
				dir = "left";
				doge.isMovingLeft = false;
			} else if (key == 39) {
				dir = "right";
				doge.isMovingRight = false;
			}
		};

    if (doge.isMovingLeft === true) {
			doge.x += doge.vx;
			doge.vx -= moveSpeed;
		} else {
			doge.x += doge.vx;
			if (doge.vx < 0) doge.vx += moveSpeed*2/3;
		}

    if (doge.isMovingLeft === false && doge.isMovingRight === false) {
      if( doge.vx> -0.07 || doge.vx < 0.07)
      doge.vx = 0;
    }

		if (doge.isMovingRight === true) {
			doge.x += doge.vx;
			doge.vx += moveSpeed;
		} else {
			doge.x += doge.vx;
			if (doge.vx > 0) doge.vx -= moveSpeed*2/3;
		}

    if(doge.vx > 8) doge.vx = 8;
		else if(doge.vx < -8) doge.vx = -8;

    if ((doge.y + doge.height) > base.y && base.y < height) {doge.jump();}

    if (doge.x > width) doge.x = 0 - doge.width;
		else if (doge.x < 0 - doge.width) doge.x = width;

    if (doge.y >= (height / 2.8) - (doge.height / 2.8)) {
			doge.y += doge.vy;
			doge.vy += gravity;
		}





    //如果doge太高的话移动platforms
    else {
			platforms.forEach(function(p, idx) {

				if (doge.vy < 0) {
					p.cy -= doge.vy;
          back.y += (doge.vy/500);
          if (back.y<0){
            win();
          }
				}

				if (p.cy > height) {
					platforms[idx] = new Platform();
					platforms[idx].cy = p.cy - height;
				}

			});

			base.y -= doge.vy;
			doge.vy += gravity;

			if (doge.vy >= 0) {
				doge.y += doge.vy;
				doge.vy += gravity;
			}
      score += Math.floor(Math.abs(doge.vy)/3);
		}


    hitPlatform();
    hitBottom();

    if (doge.isDead === true) gameOver();


  }



  function platformCalc() {
		platforms.forEach(function(platform) {
      if (platform.type == 2 || platform.type == 4) {
				if (platform.x < 0 || platform.x + platform.width > width) platform.vx *= -1;
        platform.y=platform.cy;
				platform.x += platform.vx;
        if (platform.type == 4){
          platform.y=platform.cy+Math.sin(platform.angle)*20;
          platform.angle+=0.1;
        }
			}else if(platform.type == 3 && platform.flag == 1){
        platform.y += 12;
      }else{
        platform.y=platform.cy;
      }

			platform.draw();
		});
	}

  function hitPlatform(){

    platforms.forEach(function(platform){

      if(doge.vy>0 &&
        (doge.x < platform.x+platform.width) &&
        (doge.x+doge.width > platform.x) &&
        (doge.y+doge.height > platform.y) &&
        (doge.y+doge.height < platform.y + platform.height)){
          if (platform.type == 3 && platform.flag === 0) {
  					platform.flag = 1;
  					jumpCount = 0;
            if(doge_type==='Dogiee'){
              doge.jump();
            }
  					return;
  				} else if (platform.flag == 1) return;
  				else {
            if (doge_type==='DOGE!' && Math.random()<0.25){
              doge.superJump();
            } else {
              doge.jump();
            }
            if (doge_type==='DOGE!' && Math.random()<0.5){
              platform.type = 3;
              platform.flag = 1;
            }
            if (doge_type === 'Dogiee'){
              if (platform.type == 1){
                doge.lowJump();
              }else{
                doge.highJump();
              }
            }
  				}





      }
    });
  }

  function updateScore() {
		var scoreText = document.getElementById("score");
		scoreText.innerHTML = score;
	}

  function gameOver() {
		platforms.forEach(function(p, i) {
			p.cy -= 12;
		});

		if(doge.y > height/2 && flag === 0) {
			doge.y -= 8;
			doge.vy = 0;
		}
		else if(doge.y < height / 2) flag = 1;
		else if(doge.y + doge.height > height) {
      // debugger
			showGoMenu();
			hideScore();
			doge.isDead = "lol";

			var tweet = document.getElementById("tweetBtn");
			tweet.href='http://twitter.com/share?url=http://placeholder&text=I just scored ' +score+ ' points in the Javascript Doge Jump game!';

			// var facebook = document.getElementById("fbBtn");
			// facebook.href='';

		}
	}

  function hitBottom(){
    // debugger
    if (doge.y > height){
      doge.isDead=true;
    //   // debugger
    //   alert('GG!');
    //   doge.superJump();
    }
  }



  function update(){
    paintCanvas();
    back.draw();
    platformCalc();
    dogeCalc();
    doge.draw();
    base.draw();

    updateScore();
  }

  menuLoop = function(){return;};
  loop = function(){
    update();
		requestAnimFrame(loop);
  };

  loop();

  hideMenu();
	showScore();
}

function reset() {
	hideGoMenu();
	showScore();
	doge.isDead = false;

	flag = 0;
	position = 0;
	score = 0;

	base = new Base();
	doge = new Doge();
	// Spring = new spring();
	// platform_broken_substitute = new Platform_broken_substitute();

	platforms = [];
	for (var i = 0; i < platformCount; i++) {
		platforms.push(new Platform());
	}
}

//Hides the menu
function hideMenu() {
	var menu = document.getElementById("mainMenu");
	menu.style.zIndex = -1;
}

//Shows the game over menu
function showGoMenu() {
	var menu = document.getElementById("gameOverMenu");
	menu.style.zIndex = 1;
	menu.style.visibility = "visible";

	var scoreText = document.getElementById("go_score");
	scoreText.innerHTML = "You scored " + score + " points!";
}

//Hides the game over menu
function hideGoMenu() {
	var menu = document.getElementById("gameOverMenu");
	menu.style.zIndex = -1;
	menu.style.visibility = "hidden";
}




//Show ScoreBoard
function showScore() {
	var menu = document.getElementById("scoreBoard");
	menu.style.zIndex = 1;
}

//Hide ScoreBoard
function hideScore() {
	var menu = document.getElementById("scoreBoard");
	menu.style.zIndex = -1;
}





function dogeJump() {
	doge.y += doge.vy;
	doge.vy += gravity;

	if (doge.vy > 0 &&
		(doge.x + 15 < 260) &&
		(doge.x + doge.width - 15 > 155) &&
		(doge.y + doge.height > 475) &&
		(doge.y + doge.height < 500))
		doge.jump();

	if (dir == "left") {
		doge.dir = "left";
		if (doge.vy < -7 && doge.vy > -15) doge.dir = "left_land";
	} else if (dir == "right") {
		doge.dir = "right";
		if (doge.vy < -7 && doge.vy > -15) doge.dir = "right_land";
	}

	//Adding keyboard controls
	document.onkeydown = function(e) {
		var key = e.keyCode;

		if (key == 37) {
			dir = "left";
			doge.isMovingLeft = true;
		} else if (key == 39) {
			dir = "right";
			doge.isMovingRight = true;
		}

		if(key == 32) {
			if(firstRun === true) {
				gameinit();
				firstRun = false;
			}
			else
				reset();
		}
	};

	document.onkeyup = function(e) {
		var key = e.keyCode;

		if (key == 37) {
			dir = "left";
			doge.isMovingLeft = false;
		} else if (key == 39) {
			dir = "right";
			doge.isMovingRight = false;
		}
	};

	//Accelerations produces when the user hold the keys
	if (doge.isMovingLeft === true) {
		doge.x += doge.vx;
		doge.vx -= 0.15;
	} else {
		doge.x += doge.vx;
		if (doge.vx < 0) doge.vx += 0.1;
	}

	if (doge.isMovingRight === true) {
		doge.x += doge.vx;
		doge.vx += 0.15;
	} else {
		doge.x += doge.vx;
		if (doge.vx > 0) doge.vx -= 0.1;
	}

	//Jump the doge when it hits the base
	if ((doge.y + doge.height) > base.y && base.y < height) doge.jump();

	//Make the doge move through walls
	if (doge.x > width) doge.x = 0 - doge.width;
	else if (doge.x < 0 - doge.width) doge.x = width;

	doge.draw();
  if (doge.x<=100 && doge_type !== 'DOGE!'){
    doge_type = 'DOGE!';
    console.log('DOGE!');
  }
  if(doge.x>=250 && doge_type !== 'Dogiee'){
    doge_type = 'Dogiee';
    console.log('Dogiee');
  }
  if(doge.x>100 && doge.x<250 && doge_type !== 'Doge'){
    doge_type = 'Doge';
    console.log('Doge');
  }
}


function update() {
	ctx.clearRect(0, 0, width, height);
	dogeJump();
}

menuLoop = function() {
	update();
	requestAnimFrame(menuLoop);
};

menuLoop();
