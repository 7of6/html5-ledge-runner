var MANIFEST = [
				{src:"images/player.png", id:"player-asset"},
				{src:"images/sky.jpg", id:"sky-asset"},
				{src:"images/canyon-medium.png", id:"canyon-asset"}
			],
    BASE_WIDTH = 960,
    BASE_HEIGHT = 480

function _game()
{
    window.Game = this;
	var self = this,
		w = getWidth(),
		h = getHeight(),
		// to have a good looking scaling
		// we will snap all values to 0.5-steps
		// so 1.4 e.g. becomes 1.5 - you can also
		// set the snapping to 1.0 e.g.
		// however I would recommend to use only 
		// a multiple of 0.5 - but play around
		// with it and see the results
		scale = snapValue(Math.min(w/BASE_WIDTH,h/BASE_HEIGHT),0.5),    
		ticks = 0,
		canvas,
		stage,
		background,
		world,
		player,
        score,
		keyDown = false;
    
    if (w > BASE_WIDTH || h > BASE_HEIGHT){
     
        w = BASE_WIDTH;
        h = BASE_HEIGHT;
        scale = 1;
        
    }

	self.width = w;
	self.height = h;
	self.scale = scale;
    
    // holds all collideable objects
	var collideables = [];
	self.getCollideables = function() { return collideables; };
    
    self.initPreload = function()
    {            
        preload = new createjs.PreloadJS();
        preload.onComplete = self.handleComplete;
        preload.loadManifest(MANIFEST);
    }
        
    self.initGame = function()
    {
        canvas = document.createElement('canvas');
		canvas.width = w;
		canvas.height = h;
		document.body.appendChild(canvas);
        
        stage = new createjs.Stage(canvas);
        
        background = new createjs.Bitmap(preload.getResult("sky-asset").src);
        
        background.scaleX = background.scaleY = h / preload.getResult("sky-asset").result.height;
        
		stage.addChild(background);
        
        world = new createjs.Container();
		stage.addChild(world);
        
        player = new Player(preload.getResult("player-asset").src);
        
        scoreDisplay = new createjs.Text("Distance: 0m", "15px OrbitronBold", "#000000");
        scoreDisplay.x = 6;
        scoreDisplay.y = 6;
        stage.addChild(scoreDisplay);
        
        self.reset();   
        
        
        // Setting the listeners
		if (createjs.Touch.isSupported()) { createjs.Touch.enable(stage); }
            
        stage.onPress = self.handleKeyDown;
        stage.onMouseUp = self.handleKeyUp;
            
        document.onkeydown = self.handleKeyDown;
        document.onkeyup = self.handleKeyUp;
		
		createjs.Ticker.setFPS(31);
		createjs.Ticker.addListener(self.tick, self);
        
    }
        
    self.reset = function() {
        
        score = 0;
		collideables = [];
		self.lastPlatform = null;
		world.removeAllChildren();
		world.x = world.y = 0;

		player.x = 50 * scale;
		player.y = h/2 + 50 * scale;
		player.reset();
		world.addChild(player);

		// add a platform for the hero to collide with
		self.addPlatform(10 * scale, h/1.25);

		var c, l = w / (preload.getResult("canyon-asset").result.width * 1.5) + 2, atX=0, atY = h/1.25;

		for ( c = 1; c < l; c++ ) {
			var atX = c * preload.getResult("canyon-asset").result.width*2 - 220*c;
			var atY = atY + (Math.random() * 100 - 50) * scale;
			self.addPlatform(atX,atY);
		}
	}
        
    self.tick = function(e)
	{
		var c,p,l;

		ticks++;
		player.tick();

		if ( player.y > h*2 ) {
			self.reset();
			return;
		}

		// if the hero "leaves" it's bounds of
		// screenWidth * 0.3 and screenHeight * 0.3(to both ends)
		// we will reposition the "world-container", so our hero
		// is allways visible
		if ( player.x > w*.3 ) {
			world.x = -player.x + w*.3;
		}
		if ( player.y > h*.7 ) {
			world.y = -player.y + h*.7;
		} else if ( player.y < h*.3 ) {
			world.y = -player.y + h*.3;
		}

		l = collideables.length;
		for ( c = 0; c < l; c++ ) {
			p = collideables[c];
			if ( p.localToGlobal(p.image.width,0).x < -10 ) {
				self.movePlatformToEnd(p);
			}
		}
        
        score += 0.25;
        scoreDisplay.text = "Distance: "+Math.floor(score)+"m";


		// the background 'moves' about 45% of the speed of the world-object
		// and it's position snaps back to zero once it's reached a limit 
		//background.x = (world.x * .45) % (w/GRID_HORIZONTAL);
		//background.y = (world.y * .45) % (h/GRID_VERTICAL);

//		l = parallaxObjects.length;
//		for ( c = 0; c < l; c++ ) {
//			p = parallaxObjects[c];
//			// just change the x-coordinate
//			// a change in the y-coordinate would not have any
//			// result, since it's just a white line
//			p.x = ((world.x * p.speedFactor - p.offsetX) % p.range) + p.range;
//		}

		stage.update();
	}
        
    self.handleComplete = function()
    {
        self.initGame();
    }
        
    self.handleKeyDown = function(e)
	{
		if ( !keyDown ) {
			keyDown = true;
			player.jump();
		}
	}

	self.handleKeyUp = function(e)
	{
		keyDown = false;
	}
        
    // this method adds a platform at the
	// given x- and y-coordinates and adds
	// it to the collideables-array
	self.lastPlatform = null;
	self.addPlatform = function(x,y) {
        
		x = Math.round(x);
		y = Math.round(y);

		var platform = new createjs.Bitmap(preload.getResult("canyon-asset").src);
		platform.x = x;
		platform.y = y + 80;
		platform.snapToPixel = true;

		world.addChild(platform);
		collideables.push(platform);
		self.lastPlatform = platform;
	}
        
    self.movePlatformToEnd = function(platform) {
		platform.x = self.lastPlatform.x + platform.image.width + 180 * scale;
		platform.y = self.lastPlatform.y + (Math.random() * 100 - 50)* scale;
		self.lastPlatform = platform;
	}
    
    self.initPreload();
}