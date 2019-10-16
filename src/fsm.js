class FSM {
    /**
     * Creates new FSM instance.
     * @param config
     */
    constructor(p_config) {
    	this.configStates = p_config;
    	this.configEvents = {};
    	this.statesHist = {
    		'states': [p_config.initial],
    		'curr_idx': 0
    	};

    	// Let's init the configEvents object! :-)
    	let c = p_config;
    	let statesInfo = c.states;
    	for(let state of Object.keys(statesInfo))
    	{
    		// console.log("/////////// state: " + state);
    		let tran = statesInfo[state]['transitions'];
    		for(let keyEventName of Object.keys(tran))
    		{
    			let stateTo = tran[keyEventName];

    			//console.log(keyEventName + ' -> ' + stateTo);
    			//console.log(this.configEvents['aaa']);

				// There is no $event_name in transition rules.
				// Let's add it! :-)
				let eventDesc = this.configEvents[keyEventName];
    			if (eventDesc === undefined)
    			{
    				let newEventDesc = {
    					'state_to_transit': stateTo,
    					'state_from' : {}
    				};
    				newEventDesc.state_from[state] = 1;


    				this.configEvents[keyEventName] = newEventDesc;
    			}
    			else
    			{
					// We've already added a 'from state'
					// Let's add another from state for the event
					eventDesc['state_from'][state] = 1;
    			}
    		}             

    	}
    }

    ///////////////////////////////////////////////////////////////////////
    //
    //	let isOK = checkStatesHistIndex();
    //
    checkStatesHistIndex() {
    	let size = this.statesHist.states.length;
    	let i = this.statesHist.curr_idx;

    	return (i >= 0 && i < size);
    }

    /**
     * Returns active state.
     * @returns {String}
     */
    getState() {
		let idx = this.statesHist.curr_idx;

    	if (!this.checkStatesHistIndex())
    		throw new Error("[getState->idx]: " + idx + " is wrong");

		// todo: refactor it later! ;-)
    	return this.statesHist.states[idx];
    }
    /**
     * Clears transition history
     */
    ///////////////////////////////////////////////////////////////////////
    //
    //	
    //
    clearHistory() {
    	this.statesHist.states = [];
    	this.statesHist.states.push(this.configStates['initial']);
    	this.statesHist.curr_idx = 0;
    }

    /**
     * Goes to specified state.
     * @param state
     */
    changeState(p_new_state) {
    	if (!this.checkStatesHistIndex())
    		throw new Error("[getState->idx]: " + idx + " is wrong");

		// The algo:
		// Set a new state and append it into the states' history table
		// if we are NOT during Redo or Undo
		if (p_new_state === this.getState())
			return;
		let states_list = this.getStates();
        if (states_list.indexOf(p_new_state) == -1)
        	throw new Error("[changeSate]: State " + p_new_state + " is unknown!");
		else
		{
			// Let's modify a states' history table

			let last_item_idx = this.statesHist.states.length - 1;
			let curr_idx = this.statesHist.curr_idx;

			// We are not in Redo/Undo
			if (curr_idx == last_item_idx)
			{
				this.statesHist.states.push(p_new_state);
				++this.statesHist.curr_idx;
			}
			else
			{
				//  remove the states from the states' history table
				//  starting from the current index position + 1
				let a = this.statesHist.states;
				a.splice(curr_idx+1, a.length - (curr_idx +1) + 1);
				a.push(p_new_state);

				++this.statesHist.curr_idx;
				// Hope this.statesHist.curr_idx is the 'last' idx ;-)
				// Cross the fingers! 
			}

			//console.log(this.statesHist);

		}
    }

    /**
     * Changes state according to event transition rules.
     * @param event
     */
    trigger(p_event) {

/*
    				let newEventDesc = {
    					'state_to_transit': stateTo,
    					'state_from' : {}
    				};
*/

    	
    	let event_desc = this.configEvents[p_event];

        	
		if (event_desc === undefined)
		{
			throw new Error("[trigger]: Wrong event " + p_event);
		}
		else
    	{
    		let curr_machine_state = this.getState();

    		let state_from = event_desc.state_from[curr_machine_state];
    		if (state_from === undefined)
    		{
				throw new Error("[trigger]: Wrong event" + p_event + "for state " + this.getState());
    		}
    		else
    		{
    			this.changeState(event_desc.state_to_transit);
    		}
    	}

    	
    }

    /**
     * Resets FSM state to initial.
     */
    reset() {
    	this.statesHist.curr_idx = 0;
    }

    /**
     * Returns an array of states for which there are specified event transition rules.
     * Returns all states if argument is undefined.
     * @param event
     * @returns {Array}
     */
    getStates(p_event = null) {

    	if (p_event === null)
    	{
    		//console.log(Object.keys(this.configStates.states));
    		//process.exit();

    		return Object.keys(this.configStates.states);
    	}
    	else
    	{
    		let event_desc = this.configEvents[p_event];
    		if (event_desc === undefined)
    		{
    			return [];
    			
    			//throw new Error("Can not find states for event " + p_event);
    		}
    		else
    		{
    			//console.log(Object.keys(event_desc.state_from));
    			//console.log(event_desc.state_from);
    			//process.exit();
    			return Object.keys(event_desc.state_from);
    		}
    	}
    	
    }

    /**
     * Goes back to previous state.
     * Returns false if undo is not available.
     * @returns {Boolean}
     */
    ///////////////////////////////////////////////////////////////////////
    //
    // let isSuccess = undo();
    //
    undo() {
    	let out_isSuccess = false;

    	if (this.statesHist.curr_idx != 0)
    	{
    		--this.statesHist.curr_idx;
    		out_isSuccess = true;
    	}

    	return out_isSuccess;
    }

    /**
     * Goes redo to state.
     * Returns false if redo is not available.
     * @returns {Boolean}
     */

    ///////////////////////////////////////////////////////////////////////
    //
    // let isSuccess = undo();
    //
    redo() {

    	let out_isSuccess = false;

    	let last_item_idx = this.statesHist.states.length - 1;

    	if (this.statesHist.curr_idx < last_item_idx)
    	{
			++this.statesHist.curr_idx;
    		 out_isSuccess = true;
    	}
    	
    	return out_isSuccess;

    	
    }
}

module.exports = FSM;

/** @Created by Uladzimir Halushka **/
