var util = require('util');

var miniECS = {
	entities: [],
	Components: {},
	Nodes: {},
	Systems: {}
};

var globalCount = 0;
/////////////////////////////////////////////////////// ENTITY
miniECS.Entity = function() {
	this.id = globalCount;
	globalCount++;

	this.components = {};
	this.createdNodes = {};

	this._isNodeForSystemAlreadyCreated = function(systemName) {
		for (var createdNodeForSystemName in this.createdNodes) {
			if (systemName === createdNodeForSystemName) {
				return true;
			}
		}
		return false;
	};
};
miniECS.Entity.prototype.addComponent = function(component) {
	component.entityId = this.id;
	this.components[component.name] = component;

	for (var systemName in miniECS.Systems) {
		var alreadyCreated = this._isNodeForSystemAlreadyCreated(systemName);
		if (alreadyCreated) {
			continue;
		}

		var node = {};
		var hasAllComponents = miniECS.Systems[systemName].neededComponents.every(function(componentName) {
			if (this.components[componentName]) {
				node[componentName] = this.components[componentName];
				return true;
			}
			return false;
		}, this);

		if (hasAllComponents && !alreadyCreated) {
			node.entityId = this.id;
			miniECS.Nodes[systemName].push(node);
			this.createdNodes[systemName] = node;
		}
	}
};
miniECS.Entity.prototype.removeComponent = function(componentName) {
	delete this.components[componentName];
};

/////////////////////////////////////////////////////// COMPONENTS
miniECS.Components.PositionComponent = function(x, y) {
	this.x = x || 0;
	this.y = y || 0;
};
miniECS.Components.PositionComponent.prototype.name = 'positionComponent';

miniECS.Components.VelocityComponent = function(x, y) {
	this.x = x || 0;
	this.y = y || 0;
};
miniECS.Components.VelocityComponent.prototype.name = 'velocityComponent';

miniECS.Components.PresentationComponent = function(color) {
	this.color = color || '#fff';
};
miniECS.Components.PresentationComponent.prototype.name = 'presentationComponent';

miniECS.Components.CustomScriptComponent = function(scriptByteCode) {
	this.byteCode = scriptByteCode;
};
miniECS.Components.CustomScriptComponent.prototype.name = 'customScriptComponent';

/////////////////////////////////////////////////////// SYSTEMS
var scriptingEnvSystem = function() {
	this.neededComponents = ['customScriptComponent'];
	miniECS.Nodes.scriptingEnv = [];

	this.update = function(scriptingNodes) {
		miniECS.Nodes.scriptingEnv.forEach(function (scriptingNode) {
			var customScriptComponent = scriptingNode.customScriptComponent;

			console.log('executing script entity ' + scriptingNode.entityId);
		});
	};
};
miniECS.Systems.scriptingEnv = new scriptingEnvSystem();

var renderSystem = function() {
	this.neededComponents = ['positionComponent', 'presentationComponent'];	
	miniECS.Nodes.render = [];

	this.update = function(renderNodes) {
		miniECS.Nodes.render.forEach(function (renderNode) {
			var positionComponent = renderNode.positionComponent;
			var presentationComponent = renderNode.presentationComponent;

			console.log('rendering entity ' + renderNode.entityId);
		});
	};
};
miniECS.Systems.render = new renderSystem();

//Check if works
/*
Every system declares the type of node it requires to work. (pos and vel)
When a new componen is added to an entity we check if the entity has a collection of components that are suitable to form a node.
If yes ,we create a node type for that system.
*/
var physicsSystem = function() {
	this.neededComponents = ['positionComponent', 'velocityComponent'];
	miniECS.Nodes.physics = [];

	this.update = function() {
		miniECS.Nodes.physics.forEach(function (physicsNode) {
			var positionComponent = physicsNode.positionComponent;
			var velocityComponent = physicsNode.velocityComponent;

			console.log('calculating physics on entity ' + physicsNode.entityId);
		});
	};
};
miniECS.Systems.physics = new physicsSystem();

/////////////////////////////////////////////////////// Factory
var baseGameEntity = function(x, y) {
	var baseEntity = new miniECS.Entity();

	var positionX = x || 0;
	var positionY = y || 0;
	var positionComponent = new miniECS.Components.PositionComponent(positionX, positionY);
	
	baseEntity.addComponent(positionComponent);

	return baseEntity;
};

var createTreePrefab = function() {
	var treeEntity = new baseGameEntity(12, 15);
	var presentationComponent = new miniECS.Components.PresentationComponent('#000');
	treeEntity.addComponent(presentationComponent);

	miniECS.entities.push(treeEntity);

	return treeEntity;
};

var createCarPrefab = function() {
	var carEntity = new baseGameEntity(5, 15);
	var presentationComponent = new miniECS.Components.PresentationComponent('#333');
	carEntity.addComponent(presentationComponent);
	var velocityComponent = new miniECS.Components.VelocityComponent(2, 0);
	carEntity.addComponent(velocityComponent);	

	miniECS.entities.push(carEntity);

	return carEntity;
};

var createPlayerPrefab = function() {
	var playerEntity = new baseGameEntity(20, 20);
	var presentationComponent = new miniECS.Components.PresentationComponent('#919191');
	playerEntity.addComponent(presentationComponent);

	var customScriptComponent = new miniECS.Components.CustomScriptComponent('some ugly bite-code'); //or path to some file containing ugly bite-code
	playerEntity.addComponent(customScriptComponent);

	miniECS.entities.push(playerEntity);

	return playerEntity;
};

var printObjectData = function(object) {
	console.log(JSON.stringify(object, null, 4));
};

var inspectObject = function(object) {
	console.log(util.inspect(object, { showHidden: true, depth: null, colors: true }));
};

/////////////////////////////////////////////////////// Ultimate Game Editor
createPlayerPrefab();
createTreePrefab();
createCarPrefab();

// printObjectData(miniECS);
// inspectObject(miniECS);

/////////////////////////////////////////////////////// Game Loop
for (var i=0 ; i<3 ; i++){
	console.log('FRAME: ' + i);
	for (var system in miniECS.Systems) {
		miniECS.Systems[system].update();
	}
}