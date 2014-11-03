function World() {

}


function Land() {

}

function Dungeon() {

}

var stack = [World, Land, Dungeon]


function _object(obj) {
	obj = _parent(obj);

	return obj;
}

function _parent(obj) {
	var stackIndex = 0;
	for(var x = 0; x < stack.length; x++) {
		if(obj instanceof stack[x]) {
			stackIndex = x + 1;
			break;
		}
	}
	obj.makeActive = function(o) {
		var obj = o||this;
		if(this.parent) {
			this.parent.makeActive(obj);
		} else {
			this.active = obj;
		}
		return this;
	}

	//not a parent - no children exist. 
	if(stackIndex === stack.length) {
		return obj
	}
	obj.children = [];
	obj.active = null;

	obj.newChild = function() {
		var child = _parent(new stack[stackIndex]());
		child.parent = this;
		obj.children.push(child);
		return child;
	}
	obj.getChild = function(i) {
		return obj.children[i];
	}

	return obj
}
