game.hook("OnGameFrame", onGameFrame);
game.hook("OnMapStart", onMapStart);

game.hookEvent("dota_player_kill", onPlayerKill);
game.hookEvent("dota_player_killed", onPlayerKilled);

//console.addClientCommand("pos", pos);

var init;
var changeRespawnTime = [];
var radiCour = [], direCour = [];
var playerManager;
var playersGold = [];
for (var i = 0; i < dota.MAX_PLAYERS; i++) {playersGold[i] = [];};
	
function onGameFrame(){
	if (!init){
		console.findConVar("dota_disable_top_lane").setInt(1);
		console.findConVar("dota_disable_bot_lane").setInt(1);
		console.findConVar("dota_easy_mode").setInt(1);
			
		init = true;
	}

	var clients = getClients();
	for (var i = 0; i < clients.length; i++){
		var client = clients[i];		
		var playerID = client.netprops.m_iPlayerID;
		
		var hero = client.netprops.m_hAssignedHero;
		if (!hero) continue;

		playersGold[playerID]["Radiant"] = playerManager.netprops.m_iUnreliableGoldRadiant[playerID];
		playersGold[playerID]["Dire"] = playerManager.netprops.m_iUnreliableGoldDire[playerID];

		if (hero.netprops.m_flRespawnTime > 1 && !hero.netprops.m_bReincarnating){
			if (!changeRespawnTime[playerID]){
				resptime = hero.netprops.m_flRespawnTime;
				deadtime = game.rules.props.m_fGameTime;
				time = (resptime - deadtime) * 0.20;
				
				hero.netprops.m_flRespawnTime = deadtime + time;
				
				changeRespawnTime[playerID] = true;
			}
		}
		else{
			changeRespawnTime[playerID] = false;
		}
		
		var team = client.netprops.m_iTeamNum;
		if (!radiCour["Give"] && team == dota.TEAM_RADIANT){
			radiCour["Item"] = dota.giveItemToHero("item_courier", hero);
			radiCour["Hero"] = hero;
			radiCour["PlayerID"] = playerID;
			radiCour["Give"] = true;
			radiCour["Use"] = false;
			dota.giveItemToHero("item_flying_courier", hero);
		}
		if (!direCour["Give"] && team == dota.TEAM_DIRE){
			direCour["Item"] = dota.giveItemToHero("item_courier", hero);
			direCour["Hero"] = hero;
			direCour["PlayerID"] = playerID;
			direCour["Give"] = true;
			direCour["Use"] = false;
			dota.giveItemToHero("item_flying_courier", hero);
		}
	}
	
	if (!radiCour["Use"] || !direCour["Use"]){
		var couriers = game.findEntitiesByClassname("npc_dota_courier");
		for (var i = 0; i < couriers.length; i++){
			var cour = couriers[i];
			var team = cour.netprops.m_iTeamNum;
			
			if (team = dota.TEAM_RADIANT)
				radiCour["Use"] = true;
				
			if (team = dota.TEAM_DIRE)
				direCour["Use"] = true;
		}
	}
	
	if (radiCour["Give"] && !radiCour["Use"])
		dota.executeOrders(radiCour["PlayerID"], dota.ORDER_TYPE_CAST_ABILITY_NO_TARGET, [radiCour["Hero"]], null, radiCour["Item"], false, 0, 0, 0);
	
	if (direCour["Give"] && !direCour["Use"])
		dota.executeOrders(direCour["PlayerID"], dota.ORDER_TYPE_CAST_ABILITY_NO_TARGET, [direCour["Hero"]], null, direCour["Item"], false, 0, 0, 0);
}

function onMapStart() {
	playerManager = game.findEntityByClassname(-1, "dota_player_manager");
	
	dota.removeAll("npc_dota_barracks");
	dota.removeAll("npc_dota_building");
	dota.removeAll("npc_dota_neutral_spawner");
	
	for (var i = 0; i < removeTargetName.length; i++){
		var building = game.findEntityByTargetname(removeTargetName[i]);
		if (building) dota.remove(building);
	}
	
	for(var i = 0; i < 4; i++){
		createUnit("dota_goodguys_fillers", dota.TEAM_RADIANT, -6920 + i * 200, -3050, 256, true);
		createUnit("dota_goodguys_fillers", dota.TEAM_RADIANT, -3600, -6400 + i * 200, 256, true);
		
		createUnit("dota_badguys_fillers", dota.TEAM_DIRE, 3200, 6050 - i * 200, 256, true);
		createUnit("dota_badguys_fillers", dota.TEAM_DIRE, 6000 + i * 200, 2650, 256, true);
	}
}

function onPlayerKill(event){
	for (var i = 1; i < 6; i++){
		var client = server.userIdToClient(event.getInt("killer" + i + "_userid"));
		if (!client) continue;
		var playerID = client.netprops.m_iPlayerID;
		if (!playerID) continue;
		
		playerManager.netprops.m_iUnreliableGoldRadiant[playerID] += 100;
		playerManager.netprops.m_iUnreliableGoldDire[playerID] += 100;
	}
}

function onPlayerKilled(event){
	var playerID = event.getInt("PlayerID");
	
	playerManager.netprops.m_iUnreliableGoldRadiant[playerID] = playersGold[playerID]["Radiant"];
	playerManager.netprops.m_iUnreliableGoldDire[playerID] = playersGold[playerID]["Dire"];
}

var x, y, z;
function pos(client, args){
	var hero = client.netprops.m_hAssignedHero;
	var playerId = client.netprops.m_iPlayerID;

	/*
	x = hero.netprops.m_vecOrigin.x;
	y = hero.netprops.m_vecOrigin.y;
	z = hero.netprops.m_vecOrigin.z;
	client.printToChat(x + " " + y + " " + z);
	*/
}

function createUnit(className, team, x, y, z, exact){
	var ent = dota.createUnit(className, team);
	if (!ent) return null;
	
	if (exact)
		ent.teleport(x, y, z);
	else
		dota.findClearSpaceForUnit(ent, x, y, z);
	
	return ent;
}

var removeTargetName =
[
	"dota_badguys_tower1_top",
	"dota_badguys_tower1_bot",
	"dota_badguys_tower2_top",
	"dota_badguys_tower2_bot",
	"dota_badguys_tower3_top",
	"dota_badguys_tower3_bot",
	"dota_goodguys_tower1_top",
	"dota_goodguys_tower1_bot",
	"dota_goodguys_tower2_top",
	"dota_goodguys_tower2_bot",
	"dota_goodguys_tower3_top",
	"dota_goodguys_tower3_bot"
]

function printToAll(string){
	var clients = getClients();
	for (var i = 0; i < clients.length; i++)
		clients[i].printToChat(string);
}

function getClients(){
	playing = [];
	
	for (var i = 0; i < server.clients.length; ++i){
		var client = server.clients[i];

		if (!client)
			continue;
			
		if (!client.isInGame())
			continue;

		if (client.netprops.m_iplayerID == -1)
			continue;

		playing.push(client);
	}
	
	return playing;
}
