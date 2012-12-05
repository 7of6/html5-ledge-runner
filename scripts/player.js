(function (window) {
    function Player(imgPlayer) {
        this.initialize(imgPlayer);
    }
    Player.prototype = new createjs.BitmapAnimation();

    // --------------------------------------------------------------------------
    // Constructor
    // --------------------------------------------------------------------------
    Player.prototype.BitmapAnimation_initialize = Player.prototype.initialize;
   
    Player.prototype.initialize = function (imgPlayer) {
        
        var localSpriteSheet = new createjs.SpriteSheet({
            images: [imgPlayer], //image to use
            frames: { width: 43, height: 40, regX: 21, regY: 32 }, 
            animations: {
                run: [45, 59, "run", 2],
                jump: [22, 40, "run", 2]
            }
        });
        
        this.snapToPixel = true;
        this.BitmapAnimation_initialize(localSpriteSheet);
        this.gotoAndPlay("run"); 	
                
    }
    
    // --------------------------------------------------------------------------
    // Reset Player
    // --------------------------------------------------------------------------
    Player.prototype.reset = function() {
    	this.velocity = {x:10*Game.scale,y:25*Game.scale};
       	this.onGround = false;
    };
    
    // --------------------------------------------------------------------------
    // Update
    // --------------------------------------------------------------------------
    Player.prototype.tick = function () {

        this.velocity.y += 1 * Game.scale;
		var moveBy = {x:0, y:this.velocity.y},
			collision = null,
			collideables = Game.getCollideables();

		collision = calculateCollision(this, 'y', collideables, moveBy);
		this.y += moveBy.y;

		if ( !collision ) {
			if ( this.onGround ) {
				this.onGround = false;
			}
		} else {
			if ( moveBy.y >= 0 ) {
				this.onGround = true;
			}
			this.velocity.y = 0;
		}

		moveBy = {x:this.velocity.x, y:0};
		collision = calculateCollision(this, 'x', collideables, moveBy);
		this.x += moveBy.x;
                
    }
        
    // --------------------------------------------------------------------------
    // Jump
    // --------------------------------------------------------------------------
    Player.prototype.jump = function() {
		if ( this.onGround ) {
            this.gotoAndPlay("jump");
            
            var modifier = -15 * Game.scale;
            if (modifier > -10){
                modifier = -10;
            }
            
			this.velocity.y = modifier;
			this.onGround = false;
		}
	};

    window.Player = Player;
} (window));
