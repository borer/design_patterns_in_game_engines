var miniECS = {
	entities: [],
	Components: {},
	Systems: {}
};

/////////////////////////////////////////////////////// ENTITY
miniECS.Entity = function(x, y) {
	this.id = miniECS.Entity.prototype._count;
	miniECS.Entity.prototype._count++;

	this.components = {};

	var positionX = x || 0;
	var positionY = y || 0;
	var positionComponent = new miniECS.Components.PositionComponent(positionX, positionY);
	// miniECS.Entity.prototype.addComponent(positionComponent);
	positionComponent.entity = this;
	this.components[positionComponent.name] = positionComponent;
};
miniECS.Entity.prototype._count = 0;
miniECS.Entity.prototype.addComponent = function(component) {
	component.entity = this;
	this.components[component.name] = component;
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
//Should be first in case it modifies other components
miniECS.Systems.scriptingEnv = function(entities) {
	entities.forEach( function (entity) {
		var customScriptComponent = entity.components.customScriptComponent;

		if (customScriptComponent) {
			console.log('executing custom script on entity ' + entity.id);
		}
	});
};

miniECS.Systems.render = function(entities) {
	entities.forEach( function(entity) {
		var positionComponent = entity.components.positionComponent;
		var presentationComponent = entity.components.presentationComponent;

		if (positionComponent && presentationComponent) {
			console.log('rendering entity ' + entity.id);
		}
	});
};

miniECS.Systems.physics = function(entities) {
	entities.forEach( function (entity) {
		var positionComponent = entity.components.positionComponent;
		var velocityComponent = entity.components.velocityComponent;

		if (positionComponent && velocityComponent) {
			console.log('calculating physics on entity ' + entity.id);
		}
	});
};

//Check if works
/*
Every system declares the type of node it requires to work. (pos and vel)
When a new componen is added to an entity we check if the entity has a collection of components that are suitable to form a node.
If yes ,we create a node type for that system.
*/
miniECS.Systems.physicsParallel = function(physicsNodes) {
	physicsNodes.forEach( function (physicsNode) {
		var positionComponent = physicsNode.positionComponent;
		var velocityComponent = physicsNode.velocityComponent;

		console.log('calculating physics on entity ' + physicsNode.entityId);
	});
};

/////////////////////////////////////////////////////// Factory
var createTreePrefab = function() {
	var treeEntity = new miniECS.Entity(12, 15);
	var presentationComponent = new miniECS.Components.PresentationComponent('#000');
	treeEntity.addComponent(presentationComponent);

	miniECS.entities.push(treeEntity);

	return treeEntity;
};

var createCarPrefab = function() {
	var carEntity = new miniECS.Entity(5, 15);
	var presentationComponent = new miniECS.Components.PresentationComponent('#333');
	carEntity.addComponent(presentationComponent);
	var velocityComponent = new miniECS.Components.VelocityComponent(2, 0);
	carEntity.addComponent(velocityComponent);	

	miniECS.entities.push(carEntity);

	return carEntity;
};

var createPlayerPrefab = function() {
	var playerEntity = new miniECS.Entity(20, 20);
	var presentationComponent = new miniECS.Components.PresentationComponent('#919191');
	playerEntity.addComponent(presentationComponent);

	var customScriptComponent = new miniECS.Components.CustomScriptComponent('some ugly bite-code');
	playerEntity.addComponent(customScriptComponent);

	miniECS.entities.push(playerEntity);

	return playerEntity;
};

var printObject = function(object) {
	console.log(JSON.stringify(object, null, 4));
};

/////////////////////////////////////////////////////// Ultimate Game Editor
createPlayerPrefab();
createTreePrefab();
createCarPrefab();
// printObject(miniECS.entities);

/////////////////////////////////////////////////////// Game Loop
for (var i=0 ; i<3 ; i++){
	console.log('FRAME: ' + i);
	for (var system in miniECS.Systems) {
		miniECS.Systems[system](miniECS.entities);
	}
}