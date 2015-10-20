var GameLayer = cc.Layer.extend({
	
	ctor:function(){
		this._super()
		game = this
		size = cc.winSize

		game.initData(game)
		game.initLayers(game)
		game.init_(game)
		game.__(game)
		game.initClear(game)

		game.createMoveLayer()
		game.createEnemyLayer()
		game.createTopLayer()

		game.createRule()
		game.createBg()
		game.createBranch()
		game.createFloor()
		game.createPlayer()
		game.createSnail()
		game.createGameOver()
		
		this.scheduleUpdate()
	},

	update : function( dt ){
		switch(game.state){
			case 'startGame':
				game.startGame()
			break
			case 'runGame':
				game.run()
			break
			case 'overGame':
				game.over()
			break
		}
		//
		game.clearOutSizeSpider()
		game.clearOutSizeBee()
	},

	initClear : function(){
		game.clearOutSizeSpider = function(){
			if(game.spiderArr){
				for(var i = game.spiderArr.length-1; i >= 0; i--){
					var item = game.spiderArr[i]
					if(!item.parent){
						game.spiderArr.splice(i,1)
						item = null
					}
				}
			}
		}
		game.clearOutSizeBee = function(){
			if(game.beeArr){
				for(var i = game.beeArr.length-1; i >= 0; i--){
					var item = game.beeArr[i]
					if(!item.parent){
						game.beeArr.splice(i,1)
						item = null
					}
				}
			}
		}

		
	},

	__:function(){
		game.over = function(){
			if(!lcocos.isDebugger){
				ggay()
			}
			
			game.state = 'sb'
			game.tl.addChild(game.gop,10)
			game.g_scoreLabel.setString(game.scoreValue)
			if(lcocos.userData.score<game.scoreValue){
	        	lcocos.userData.score = game.scoreVaue
	        	lcocos.saveUserData()
	        }
	        game.g_bestLabel.setString(lcocos.userData.score)
		}

		game.startGame = function(){
			// add touch handler
			game.touchHandler(game,function(){
				game.state = 'runGame'
				game.floor.removeFromParent(true)
				game.schedule(game.createSpider,2,9999,0)
				game.schedule(game.createBee,2,9999,1)
				game.scheduleOnce(function(){
					var listener = lcocos.event.getListener_begin(function(touch,event){
						var touchPoint = touch.getLocation();
						var worldPoint = lcocos.point.getWorldPosByObject(game.player)
				        var offX = touchPoint.x - worldPoint.x;
				        var offY = touchPoint.y - worldPoint.y;
				        var angle = Math.atan2( offY , offX ) / Math.PI * 180;
				        angle = 90 - angle - 180;
				        var r = angle*Math.PI/180
				        game.player.stopAllActions();
				        game.player.runAction(
				            new cc.Sequence (
				                new cc.rotateTo(0.01,angle),
				                new cc.CallFunc (
				                    function ( ) {
				                    	game.player.to = true	
				                    },
				                    game
				                )
				            )
				        )
					})
					cc.eventManager.addListener(listener, game);
				},1)
			})
		}

		game.checkCollion = function(){
			// p with bee
			var p = game.player
			if(!p.to)return
			var bee
			for(var i = 0; i < game.beeArr.length; i++){
				bee = game.beeArr[i]
				if(lcocos.util.hasCollision(p,bee)){
					p.speed = game.speed
					p.to = false
					p.call = true
					if(bee.rotation>90){
						game.state = 'overGame'
					}
					game.scoreValue++
					game.scoreLabel.setString(game.scoreValue)
					bee.runAction(
						cc.sequence(
							cc.moveBy(0.5,cc.p(0,-300)),
							cc.callFunc(function(){
								bee.removeFromParent(true)
							})
						)
					)
				}
			}

			var spider
			for(var i = 0; i < game.spiderArr.length; i++){
				spider = game.spiderArr[i]
				if(lcocos.util.hasCollision(p,spider)){
					p.speed = game.speed
					p.to = false
					p.call = true
					game.scoreValue++
					game.scoreLabel.setString(game.scoreValue)
					spider.line.removeFromParent(true)
					spider.line=null
					spider.runAction(
						cc.sequence(
							cc.moveBy(0.2,cc.p(0,-300)),
							cc.callFunc(function(){
								spider.removeFromParent(true)
							})
						)
					)
				}
			}
		}
		game.run = function(){
			game.updateSpider()
			game.updateBee()
			game.checkCollion()
			game.to()
			game.speedLabel.setString(Math.floor(game.speed))
			game.updateSnail()
			//s = vt - at*t/2
			// s = ?
			game.player.y += game.speed

			var point = lcocos.point.getWorldPosByObject(game.player)
			if(point.y > size.height-200){
				game.ml.y -= game.speed	
			}
			game.speed -=0.1
			if(game.speed < 0){
				game.speed = 0
				game.state = 'overGame'
				return
			}
			game.updateBackground()
			game.updateBranch()
			

		}
		game.to = function(){
			var point = lcocos.point.getWorldPosByObject(game.player)
			if(game.player.to){
				radian = Math.PI / 180 * game.player.getRotation();
				game.player.x -= 30 * Math.sin(radian)
				game.player.y -= 30 * Math.cos(radian)
				if(point.x<20||point.y<0||point.x>size.width-20||point.y>size.height-20){
					game.state = 'overGame'
				}
			}
			if(game.player.call){
				radian = Math.PI / 180 * game.player.getRotation();
				game.player.x += 30 * Math.sin(radian)
				game.player.y += 30 * Math.cos(radian)	
			}
			if(point.y>size.height-200){
				if(game.player.call){
					game.player.rotation = 0
					game.speed = 30
				}
				game.player.call = false
				if(game.snail){
					if(game.scoreValue!=0&&game.scoreValue % 10 == 0){
						game.showSnail()
					}
					
				}
					
			}

		}
		game.updateSnail = function(){
			if(game.snail){
				if(game.snail.parent){
					var pp = game.player.getPosition()
					game.snail.setPosition(pp)
				}	
			}
		}
		game.showSnail = function(){
			if(game.snail.parent){
				return
			}
			var pp = game.player.getPosition()
			game.ml.addChild(game.snail)
			game.snail.setPosition(pp)
			game.speed = 60
			this.scheduleOnce(function(){
				game.scoreValue++
				game.speed = 30
				game.snail.removeFromParent(true)
			},6)
		}
		game.updateBee = function(){
			if(!game.beeArr)return
			for(var i = 0; i < game.beeArr.length; i++){
				var item = game.beeArr[i]
				item.y += item.speed
				item.speed -= 0.2
				if(item.speed<10 && item.speed>-10){
					if(item.rotation<180){
						item.rotation+=20
					}
				}else{
					if(item.rotation>0){
						item.rotation-=20
					}

				}
				if(item.y < -30){
					item.removeFromParent(true)
				}
			}
		}
		game.updateSpider = function(){
			if(!game.spiderArr)return 
			for(var i = 0; i < game.spiderArr.length; i++){
				var item = game.spiderArr[i]
				if(item.line){
					item.line.clear()
					item.line.drawSegment(item.getPosition(), cc.p(item.x,900), 1)
				}
				item.y += item.speed
				item.speed -= 0.2
				if(item.y < -30){
					if(item.line){
						item.line.removeFromParent(true)
						item.line.clear()
						item.line = null
					}
					item.removeFromParent(true)
				}
			}
		}
		game.updateBranch = function(){
			var item
			var point
			for(var i = 0; i < game.branchArr.length; i++){
				item = game.branchArr[i]
				point = lcocos.point.getWorldPosByObject(item)
				if(point.y < -size.height/2){
					item.y += item.height * 3 + (Math.random()*60 - 30)
				}
			}
		}
		game.updateBackground = function(){
			var item
			var point
			for(var i = 0; i < game.bgArr.length; i++){
				item = game.bgArr[i]
				point = lcocos.point.getWorldPosByObject(item)
				if(point.y < -size.height/2){
					item.y += item.height * 2
				}
			}
		}
	},

	init_:function(game){
				
		game.touchHandler = function(tar,call){
			var listener = lcocos.event.getListener_begin(call)
			cc.eventManager.addListener(listener, tar);
		}
		game.createSnail = function(){
			game.snail = lcocos.util.getSprite(res.gameScene_snail_png)
		}
		game.createGameOver = function(){
			game.gop = new cc.Layer()
			game.gop.setPosition(cc.p(size.width/2,size.height/2))
			//game.tl.addChild(gop)
			var bg = lcocos.util.getSprite(res.overScene_bg_png)
			game.gop.addChild(bg)
			game.g_scoreLabel = lcocos.util.getLabel()
			game.gop.addChild(game.g_scoreLabel)
			game.g_scoreLabel.setPosition(cc.p(40,-100))
			game.g_scoreLabel.setColor(cc.color(255,99,71,255))
			game.g_scoreLabel.setString(game.scoreValue)
			game.g_bestLabel = lcocos.util.getLabel()
			game.gop.addChild(game.g_bestLabel)
			game.g_bestLabel.setPosition(cc.p(40,-150))
			game.g_bestLabel.setColor(cc.color(255,99,71,255))
			
	        
			var restart = lcocos.button.getUIBtn(res.overScene_restart_png ,function(){
				lcocos.scenesManager.goScene('game scene')
			},game)
			game.gop.addChild(restart)
			restart.setPosition(cc.p(80,-300))
			var home = lcocos.button.getUIBtn(res.overScene_home_png, function(){
				window.location.href = '/'
			},game)
			game.gop.addChild(home)
			home.setPosition(cc.p(-80,-300))
		}
		game.createSpeedLabel = function(){
			game.speedLabel = lcocos.util.getLabel()
			game.tl.addChild(game.speedLabel)
			game.speedLabel.setString(game.speed)
			game.speedLabel.setColor(cc.color(255,99,71,255))
			game.speedLabel.setPosition(cc.p(size.width-100,size.height-50))
		}
		game.createScoreLable = function(){
			game.scoreValue = 0;
			game.scoreLabel = lcocos.util.getLabel();
			game.tl.addChild(game.scoreLabel)
			game.scoreLabel.setString(game.scoreValue)
			game.scoreLabel.setPosition(cc.p(100,size.height-50))
			game.scoreLabel.setColor(cc.color(255,99,71,255))
		}
		game.createScoreBg = function(){
			var bg = lcocos.util.getSprite(res.gameScene_score_png)
			game.tl.addChild(bg)
			bg.setPosition(cc.p(size.width/2,size.height-bg.height/2)) 
		}
		game.createBee = function(){
			
			var bee = lcocos.util.getSprite(res.gameScene_bee_png)
			game.el.addChild(bee,10)
			bee.setPosition(cc.p(Math.random()*size.width,-20))
			bee.speed = game.enemy_speed
			game.beeArr.push(bee)
		}
		game.createSpider = function(){
			
			var spider = lcocos.util.getSprite(res.gameScene_spider_png);
			game.el.addChild(spider,10)
			spider.setPosition(cc.p(Math.random()*size.width,-20))
			spider.speed = game.enemy_speed
			spider.line = new cc.DrawNode()
			game.el.addChild(spider.line)
			game.spiderArr.push(spider)
		}
		
		// add rule
		game.createRule = function(){
			var rule = lcocos.util.getSprite(res.gameScene_rule_png);
			game.tl.addChild(rule)
			rule.setPosition(cc.p(size.width/2,size.height/2))
			var close = lcocos.button.getUIBtn(res.gameScene_close_png,function(event,type){
				rule.removeFromParent(true)
				close.removeFromParent(true)
				game.state = 'startGame'
				game.createScoreBg()
				game.createScoreLable()
				game.createSpeedLabel()
			},game)
			game.tl.addChild(close)
			close.setPosition(cc.p(rule.x+180,rule.y+180))
			//lcocos.effect.heartbeat(close)
		}
		game.createBranch = function(){
			game.branchArr = []
			function get(data){
				var branch = lcocos.util.getSprite(res.gameScene_branch_png);
				game.ml.addChild(branch)
				branch.setPosition(data.point)
				branch.setScaleX(data.scaleX)
				branch.setScaleY(data.scaleY)
				return branch
			}
			var datas = [
				{point:cc.p(size.width/2,200),scaleX:1,scaleY:1},
				{point:cc.p(size.width/2,700),scaleX:-1,scaleY:-1},
				{point:cc.p(size.width/2,1200),scaleX:1,scaleY:1},
			]
			for(var i = 0; i < datas.length; i++){
				game.branchArr.push(get(datas[i]))
			}
		}
		game.createFloor = function(){
			game.floor = lcocos.util.getSprite(res.gameScene_floor_png);
			game.tl.addChild(game.floor)
			game.floor.setPosition(cc.p(size.width/2,12))
		}
		// add bg
		game.createBg = function(){
			game.bgArr = []
			function get(point){
				var bg = lcocos.util.getSprite(res.gameScene_bg_png);
				game.ml.addChild(bg)
				bg.setPosition(point)
				return bg
			}
			var points = [
				lcocos.point.getCenter(),
				cc.p(size.width/2,size.height/2*3)
			]
			for(var i = 0; i < points.length; i++){
				game.bgArr.push(get(points[i]))
			}
		}
		game.createPlayer = function(){
			game.player = new cc.Sprite(res.gameScene_player_stop_png)
			game.ml.addChild(game.player)
			game.player.setAnchorPoint(cc.p(0.5,0))
			game.player.setPosition(cc.p(size.width/2,26))
		}
		// add play button
		game.createPlayBtn = function(){
			var btn = lcocos.button.getUIBtn(res.startScene_play_png,function(event,type){
				lcocos.scenesManager.goScene('game scene')
			},game)
			game.addChild(btn)
			btn.setPosition(cc.p(size.width/2,200))
			lcocos.effect.heartbeat(btn)
		}

	},

	initLayers : function(game){
		game.createMoveLayer = function(){
			game.ml = new cc.Layer()
			game.addChild(game.ml)
		}
		game.createTopLayer = function(){
			game.tl = new cc.Layer()
			game.addChild(game.tl)
		}
		game.createEnemyLayer = function(){
			game.el = new cc.Layer()
			game.addChild(game.el)
		}
	},

	initData : function(game){
		game.beeArr = []
		game.spiderArr = []
		game.speed = 30
		game.enemy_speed = 16
	}
})




























var StartLayer = cc.Layer.extend({
	
	ctor:function(){
		this._super()
		game = this
		size = cc.winSize

		game.init_(game)
		
		game.createBg()
		game.createPlayBtn()
	},
	init_:function(game){
		// add bg
		game.createBg = function(){
			var bg = lcocos.util.getSprite(res.startScene_bg_png);
			game.addChild(bg)
			bg.setPosition(lcocos.point.getCenter())
		}
		// add play button
		game.createPlayBtn = function(){
			var btn = lcocos.button.getUIBtn(res.startScene_play_png,function(event,type){
				lcocos.scenesManager.goScene('game scene')
			},game)
			game.addChild(btn)
			btn.setPosition(cc.p(size.width/2,200))
			lcocos.effect.heartbeat(btn)
		}
	}
})

