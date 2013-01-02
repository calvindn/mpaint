jQuery(document).ready(function()
{

	var canvas = document.getElementById('myCanvas');
	var context = canvas.getContext('2d');
	canvas.width  = 800;
	canvas.height = 500;
	canvas.onselectstart = function () { return false; } // ie
	canvas.onmousedown = function () { return false; } // mozilla/chrome

	mouse = new Object();
	mouse.d = false;

	menu = new Object();
	menu.line = true;
	menu.circle = false;
	menu.rect = false;
	menu.erase = false;

	var oldhex;
	var buttonBG = '0000ff';
	var displayLW = 2;

	line = {
			x : [],
			y : [],
			drag : [],
			drawn : 0,
			lineWidth : 11,
			colour : "#0000ff"
	}

	circle = {
				x1 : 0,
				x2 : 0,
				y1 : 0,
				y2 : 0,
				colour : "#0000ff"
			}

	rect = {
				x1 : 0,
				x2 : 0,
				y1 : 0,
				y2 : 0,
				colour : "#0000ff"
			}

	context.fillStyle = "#1a1217";
	context.beginPath();
	context.rect(0, 0, canvas.width, canvas.height);
	context.closePath();
	context.fill();

	/* colour picker */
	/* http://www.eyecon.ro/colorpicker/ */
	$('#colorSelector').ColorPicker({
		color: '#0000ff',
		onShow: function (colpkr) 
		{
			$(colpkr).fadeIn(200);
			return false;
		},
		onHide: function (colpkr) 
		{
			$(colpkr).fadeOut(200);
			return false;
		},
		onChange: function (hsb, hex, rgb) 
		{
			$('#colorSelector div').css('backgroundColor', '#' + hex);
			
			if (menu.erase == false)
			{
				line.colour = hex;
				circle.colour = hex;
				rect.colour = hex;

				if (menu.circle == true){
				$('#circleButton').css('backgroundColor', '#' + hex);
				}
				else if (menu.rect == true){
					$('#rectButton').css('backgroundColor', '#' + hex);
				}

			}
			else
			{
				oldhex = hex;
			}
			buttonBG = hex;
		}
	});
	
	$('#clearButton').click(function()
	{
    	clearCanvas();
		socket.emit('clear');
  	});

  	$('#circleButton').click(function()
  	{
  		if (menu.circle == true)
  		{
  			$('#circleButton').css('backgroundColor', '#ffffff');
  			menu.circle = false;
  			$('#rectButton').css('backgroundColor', '#ffffff');
  			menu.rect = false;
  			menu.line = true;
  		} 
  		else if (menu.circle == false)
  		{
  			if (menu.erase == true)
  			{
  				$('#circleButton').css('backgroundColor', '#1a1217');
  			}
  			else
  			{
  				$('#circleButton').css('backgroundColor', '#' + buttonBG);
  			}
  			menu.circle = true;
  			$('#rectButton').css('backgroundColor', '#ffffff');
  			menu.rect = false;
  			menu.line = false;
  		}
  	});

  	$('#rectButton').click(function()
  	{
  		if (menu.rect == true)
  		{
  			$('#circleButton').css('backgroundColor', '#ffffff');
  			menu.circle = false;
  			$('#rectButton').css('backgroundColor', '#ffffff');
  			menu.rect = false;
  			menu.line = true;
  		} 
  		else if (menu.rect == false)
  		{
  			if (menu.erase == true)
  			{
  				$('#rectButton').css('backgroundColor', '#1a1217');
  			}
  			else
  			{
  				$('#rectButton').css('backgroundColor', '#' + buttonBG);
  			}
  			$('#circleButton').css('backgroundColor', '#ffffff');
  			menu.circle = false;
  			menu.rect = true;
  			menu.line = false;
  		}
  	});

  	$('#eraseButton').click(function()
  	{
  		if (menu.erase == true)
  		{
  			$('#eraseButton').css('backgroundColor', '#ffffff');
  			menu.erase = false;

  			line.colour = oldhex;
			circle.colour = oldhex;
			rect.colour = oldhex;

			if (menu.circle)
			{
				$('#circleButton').css('backgroundColor', '#' + buttonBG);
			}
			else if (menu.rect)
			{
				$('#rectButton').css('backgroundColor', '#' + buttonBG);
			}
  		}
  		else if (menu.erase == false)
  		{
			$('#eraseButton').css('backgroundColor', '#1a1217');
  			menu.erase = true;

  			oldhex = line.colour;

  			line.colour = '#1a1217';
			circle.colour = '#1a1217';
			rect.colour = '#1a1217';

			if (menu.circle)
			{
				$('#circleButton').css('backgroundColor', '#1a1217');
			}
			else if (menu.rect)
			{
				$('#rectButton').css('backgroundColor', '#1a1217');
			}
		};
  	});

	function clearCanvas()
	{
		context.fillStyle = "#1a1217";
		context.beginPath();
		context.rect(0, 0, canvas.width, canvas.height);
		context.closePath();
		context.fill();
	}

	/*
	 * SOCKET CONNECTON TO SERVER
	 */
	//var socket = io.connect('http://192.168.0.2:7878');
	var socket = io.connect('http://192.168.0.5:7878');
	socket.on('newLine', function (data) 
	{
		drawLine(data);
	});

	socket.on('newCircle', function (data) 
	{
		drawCircle(data);
	});

	socket.on('newRect', function (data) 
	{
		drawRect(data);
	});

	socket.on('clearCanvas', function () 
	{
		clearCanvas();
	});

	// EVENTS
	$(canvas).mousemove(function(e)
	{
		if (mouse.d)
		{
			addVector(e.pageX, e.pageY, true);
		}
		
   });
   
   $(canvas).mousedown(function(e)
   {
   		if (menu.circle)
   		{
   			circle.x1 = e.pageX;
   			circle.y1 = e.pageY;
   		}
   		else if (menu.rect)
   		{
   			rect.x1 = e.pageX;
   			rect.y1 = e.pageY;
   		}
   		else
   		{ //line
			mouse.d = true;
			addVector(e.pageX, e.pageY, false);
		}
   });

   $(canvas).mouseup(function(e)
   {
		if (menu.circle)
		{
   			circle.x2 = e.pageX;
   			circle.y2 = e.pageY;
   			drawCircle(circle);
   			socket.emit('circleCompleted', circle);
   		}
   		else if (menu.rect)
   		{
   			rect.x2 = e.pageX;
   			rect.y2 = e.pageY;
   			drawRect(rect);
   			socket.emit('rectCompleted', rect);
   		}
   		else
   		{ //line
			mouse.d = false;
			line = {
				x : [],
				y : [],
				drag : [],
				drawn : 0,
				lineWidth : line.lineWidth,
				colour : line.colour
			}
		}
   }); 
   
   $(canvas).mouseleave(function(e)
   {
		mouse.d = false;
   }); 

   $(document).keyup(function(e) 
   {
      switch(e.keyCode) { 
         // User pressed "+"
         case 187:
         	if (line.lineWidth < 50)
         	{
            	line.lineWidth = line.lineWidth + 10;
            	displayLW = displayLW + 1;
            	$('#brushSize').html('brush size = ' + displayLW);
         	}
         break;
         // User pressed "-"
         case 189:
         	if (line.lineWidth > 10)
         	{
            	line.lineWidth = line.lineWidth - 10;
            	displayLW = displayLW - 1;
            	$('#brushSize').html('brush size = ' + displayLW);
         	}
         break;
      }
       
   });

   //FUNCTIONS
   function addVector(x, y, drag)
   {
   		line.x.push(x);
   		line.y.push(y);
   		line.drag.push(drag);
   		//send here for inefficient data transfer but
   		//real time drawing
   		socket.emit('lineCompleted', line);
   		drawLine(line);
   }

   function drawCircle(circleToDraw)
   {	
   		var radius = calculateRadius(circleToDraw);
   		context.beginPath();
		context.arc(circleToDraw.x1, circleToDraw.y1, radius, 0, 2 * Math.PI, false);
		context.fillStyle = circleToDraw.colour;
		context.fill();

		
   }

   function drawRect(rectToDraw)
   {
		context.beginPath();
		context.rect(rectToDraw.x1, rectToDraw.y1, ((rectToDraw.x1-rectToDraw.x2)*(-1)), ((rectToDraw.y1-rectToDraw.y2)*(-1)));
		context.closePath();
		context.fillStyle = rectToDraw.colour;
		context.fill();
   }

   function calculateRadius(circleToDraw)
   {
   		var a = Math.pow((circleToDraw.x2 - circleToDraw.x1), 2);
   		var b = Math.pow((circleToDraw.y2 - circleToDraw.y1), 2);
   		var c = a+b;
   		c = Math.sqrt(c);
   		return (c);
   }

   function drawLine(lineToDraw)
   {
   		context.strokeStyle = lineToDraw.colour;
	  	context.lineJoin = "round";
	 	context.lineWidth = lineToDraw.lineWidth;
	 	/* line drawing */
	 	/*http://www.williammalone.com/articles/create-html5-canvas-javascript-drawing-app/*/
		for (var i=lineToDraw.drawn; i < lineToDraw.x.length; i++){
			
			context.beginPath();
			if (lineToDraw.drag[i] && i){
				context.moveTo(lineToDraw.x[i-1], lineToDraw.y[i-1]);
			}
			else {
				context.moveTo(lineToDraw.x[i]-1, lineToDraw.y[i]);
			}

			context.lineTo(lineToDraw.x[i], lineToDraw.y[i]);
			context.closePath();
			context.stroke();
		}
		lineToDraw.drawn = lineToDraw.x.length;
	}

	function time()
	{
		//$('#status').html(new Date().getTime());
		//$('#status2').html('current = ' + current);
		$('#brushSize').html('brush size = ' + line.lineWidth);
	}

});

