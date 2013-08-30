game.hook("OnGameFrame", onGameFrame);
game.hook("OnMapStart", onMapStart);

//console.addClientCommand("pos", pos);

var init;
var changeRespawnTime = [];
var radiCour = [], direCour = [];

function onGameFrame()
{
	if (!init)
	{
		console.findConVar("dota_disable_top_lane").setInt(1);
		console.findConVar("dota_disable_bot_lane").setInt(1);
		console.findConVar("dota_easy_mode").setInt(1);
			
		init = true;
	}
	
	var clients = getConnectedPlayingClients();
	for (var i in clients)
	{
		var client = clients[i];
		
		var hero = client.netprops.m_hAssignedHero;
		if (!hero) continue;
		
		var playerId = client.netprops.m_iPlayerID;
		
		if (hero.netprops.m_flRespawnTime > 1 && !hero.netprops.m_bReincarnating)
		{
			if (!changeRespawnTime[playerId])
			{
				hero.netprops.m_flRespawnTime *= 0.15;
				changeRespawnTime[playerId] = true;
			}
		}
		else
		{
			changeRespawnTime[playerId] = false;
		}
		
		var team = client.netprops.m_iTeamNum;
		if (!radiCour["Give"] && team == dota.TEAM_RADIANT)
		{
			radiCour["Item"] = dota.giveItemToHero("item_courier", hero);
			radiCour["Hero"] = hero; radiCour["PlayerID"] = playerId; radiCour["Give"] = true; radiCour["Use"] = false;
			dota.giveItemToHero("item_flying_courier", hero);
		}
		if (!direCour["Give"] && team == dota.TEAM_DIRE)
		{
			direCour["Item"] = dota.giveItemToHero("item_courier", hero);
			direCour["Hero"] = hero; direCour["PlayerID"] = playerId; direCour["Give"] = true; direCour["Use"] = false;
			dota.giveItemToHero("item_flying_courier", hero);
		}
	}
	
	if (radiCour["Use"] && !radiCour["Use"])
	{
		if (!radiCour["Item"])
			radiCour["Use"] = true;
		else
			dota.executeOrders(radiCour["PlayerID"], dota.ORDER_TYPE_CAST_ABILITY_NO_TARGET, [radiCour["Hero"]], null, radiCour["Item"], false, 0, 0, 0);
	}
	
	if (direCour["Give"] && !direCour["Use"])
	{
		if (!direCour["Item"])
			direCour["Use"] = true;
		else
			dota.executeOrders(direCour["PlayerID"], dota.ORDER_TYPE_CAST_ABILITY_NO_TARGET, [direCour["Hero"]], null, direCour["Item"], false, 0, 0, 0);
	}
}

function onMapStart() 
{
	dota.removeAll("npc_dota_barracks*");
	dota.removeAll("npc_dota_building*");
	dota.removeAll("npc_dota_neutral_spawner*");
	
	for (var i in removeTargetName)
	{
		var building = game.findEntityByTargetname(removeTargetName[i]);
		if (building) dota.remove(building);
	}
	
	for(var i = 0; i < 4; i++)
	{
		createUnit("dota_goodguys_fillers", dota.TEAM_DIRE, 3200, 6050 - i * 200, 256, true);
		createUnit("dota_goodguys_fillers", dota.TEAM_DIRE, 6000 + i * 200, 2650, 256, true);
		
		createUnit("dota_goodguys_fillers", dota.TEAM_RADIANT, -6880 + i * 200, -3050, 256, true);
		createUnit("dota_goodguys_fillers", dota.TEAM_RADIANT, -3600, -6400 + i * 200, 256, true);
	}
}

var x, y, z;
function pos(client, args)
{
	var hero = client.netprops.m_hAssignedHero;
	var playerId = client.netprops.m_iPlayerID;
	x = hero.netprops.m_vecOrigin.x + 300;
	y = hero.netprops.m_vecOrigin.y;
	z = hero.netprops.m_vecOrigin.z;
	client.printToChat(x + " " + y + " " + z);
}

function createUnit(className, team, x, y, z, exact)
{
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

function printToAll(string)
{
	var clients = getConnectedPlayingClients();
	for (var i in clients)
		clients[i].printToChat(string);
}

function getConnectedPlayingClients()
{
	var client, playing = [];
	
	for (var i = 0; i < server.clients.length; ++i)
	{
		client = server.clients[i];

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
