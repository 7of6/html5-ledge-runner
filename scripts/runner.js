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
    
	var collideables = [];
	self.getCollideables = function() { return collideables; };
    
    // --------------------------------------------------------------------------
    // Preload
    // --------------------------------------------------------------------------
    self.initPreload = function()
    {            
        preload = new createjs.PreloadJS();
        preload.onComplete = self.handleComplete;
        preload.loadManifest(MANIFEST);
    }
       
    // --------------------------------------------------------------------------
    // Initialization
    // --------------------------------------------------------------------------
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
        
		if (createjs.Touch.isSupported()) { createjs.Touch.enable(stage); }
            
        stage.onPress = self.handleKeyDown;
        stage.onMouseUp = self.handleKeyUp;
            
        document.onkeydown = self.handleKeyDown;
        document.onkeyup = self.handleKeyUp;
		
		createjs.Ticker.setFPS(31);
		createjs.Ticker.addListener(self.tick, self);
        
    }
    
    // --------------------------------------------------------------------------
    // Reset Game
    // --------------------------------------------------------------------------
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

		self.addPlatform(10 * scale, h/1.25);

		var c, l = w / (preload.getResult("canyon-asset").result.width * 1.5) + 2, atX=0, atY = h/1.25;

		for ( c = 1; c < l; c++ ) {
			var atX = c * preload.getResult("canyon-asset").result.width*2 - 220*c;
			var atY = atY + (Math.random() * 100 - 50) * scale;
			self.addPlatform(atX,atY);
		}
	}
    
    // --------------------------------------------------------------------------
    // Update
    // --------------------------------------------------------------------------
    self.tick = function(e)
	{
		var c,p,l;

		ticks++;
		player.tick();

		if ( player.y > h*2 ) {
			self.reset();
			return;
		}

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

		stage.update();
	}
    
    // --------------------------------------------------------------------------
    // Platform Management
    // --------------------------------------------------------------------------
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
        
    // --------------------------------------------------------------------------
    // Event Handlers
    // --------------------------------------------------------------------------
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
    
    // --------------------------------------------------------------------------
    // Initial Call
    // --------------------------------------------------------------------------
    self.initPreload();
}