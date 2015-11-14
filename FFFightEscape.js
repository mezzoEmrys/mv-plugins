//=============================================================================
// FFFightEscape.js
//=============================================================================

/*:
 * @plugindesc Replace [fight/escape] menu with each actor being able to escape.
 * @author mezzoEmrys
 * 
 * @help 
 *  To make this work, create a common event with Script : BattleManager.processEscape();
 *  Next, edit the default escape skill (#6) to have Scope: None and replace its effect  
 *  with the common event created above.
 *  Skill #6 will be used when you select the Escape command.
 */
 
(function () {
	var parameters = PluginManager.parameters('FFFightEscape');

	Game_BattlerBase.prototype.escapeSkillId = function() {
    	return 6;
	};

	Game_BattlerBase.prototype.canEscape = function() {
    	return this.canUse($dataSkills[this.escapeSkillId()]);
	};

	Window_ActorCommand.prototype.addEscapeCommand = function() {
		this.addCommand(TextManager.escape, 'escape', this._actor.canEscape());
	};


	var _Window_ActorCommand_makeCommandList =
	  Window_ActorCommand.prototype.makeCommandList;
	Window_ActorCommand.prototype.makeCommandList = function() {
	    _Window_ActorCommand_makeCommandList.call(this);
	    if (this._actor) {
	        this.addEscapeCommand();
	    }
	};

	//override
	Scene_Battle.prototype.changeInputWindow = function() {
	    if (BattleManager.isInputting()) {
	    	if(BattleManager.actor()){
	    		this.startActorCommandSelection();
	    	} else {
	    		//this.startPartyCommandSelection();
		        BattleManager.selectNextCommand();
		    }
	    } else {
	        this.endCommandSelection();
	    }
	};

	var _Scene_Battle_createActorCommandWindow =
	   Scene_Battle.prototype.createActorCommandWindow;
	Scene_Battle.prototype.createActorCommandWindow = function() {
	    _Scene_Battle_createActorCommandWindow.call(this);
	    this._actorCommandWindow.setHandler('escape', this.commandEscape.bind(this));
	};

	//override
	Scene_Battle.prototype.commandEscape = function() {
		//BattleManager.processEscape();
    	//this.changeInputWindow();
	    BattleManager.inputtingAction().setEscape();
	    this.selectNextCommand();
	};

	Game_Action.prototype.setEscape = function() {
    	this.setSkill(this.subject().escapeSkillId());
	};


	//override
	BattleManager.processEscape = function() {
	    //$gameParty.removeBattleStates();
	    $gameParty.performEscape();
	    SoundManager.playEscape();
	    var success = this._preemptive ? true : (Math.random() < this._escapeRatio);
	    if (success) {
	    	$gameParty.removeBattleStates();
	        //this.displayEscapeSuccessMessage();
	        this._escaped = true;
	        this.processAbort();
	    } else {
	        //this.displayEscapeFailureMessage();
	        this._logWindow.addText(TextManager.escapeFailure);
	        this._escapeRatio += 0.1;
	        //$gameParty.clearActions();
        	//this.startTurn();
	    }
	    return success;
	};


})();

function FFEscape() {
	BattleManager.processEscape();
}