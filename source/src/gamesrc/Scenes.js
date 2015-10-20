
var StartScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        
        if(!lcocos.isDebugger){
        	ggax()
        }
        
        lcocos.fetchUserData()

        if(!lcocos.userData.score){
            lcocos.userData.score=0
            lcocos.saveUserData()
        }
        var layer = new StartLayer();
        this.addChild(layer);
    }
});

var GameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new GameLayer();
        this.addChild(layer);
    }
});

var EndScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        
        if(!lcocos.isDebugger){
        	ggay()
        }

        var layer = new EndLayer();
        this.addChild(layer);
    }
});

