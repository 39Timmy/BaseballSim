const $=id=>document.getElementById(id);
const leagues={'American League':{East:['Baltimore Orioles','Boston Red Sox','New York Yankees','Tampa Bay Rays','Toronto Blue Jays'],Central:['Chicago White Sox','Cleveland Guardians','Detroit Tigers','Kansas City Royals','Minnesota Twins'],West:['Athletics','Houston Astros','Los Angeles Angels','Seattle Mariners','Texas Rangers']},'National League':{East:['Atlanta Braves','Miami Marlins','New York Mets','Philadelphia Phillies','Washington Nationals'],Central:['Chicago Cubs','Cincinnati Reds','Milwaukee Brewers','Pittsburgh Pirates','St Louis Cardinals'],West:['Arizona Diamondbacks','Colorado Rockies','Los Angeles Dodgers','San Diego Padres','San Francisco Giants']}};
const teamColors={'Baltimore Orioles':'#df4601','Boston Red Sox':'#bd3039','New York Yankees':'#003087','Tampa Bay Rays':'#8FBCE6','Toronto Blue Jays':'#134a8e','Chicago White Sox':'#27251f','Cleveland Guardians':'#e31937','Detroit Tigers':'#0c2c56','Kansas City Royals':'#004687','Minnesota Twins':'#002b5c','Athletics':'#003831','Houston Astros':'#002d62','Los Angeles Angels':'#ba0021','Seattle Mariners':'#005c5c','Texas Rangers':'#003278','Atlanta Braves':'#13274f','Miami Marlins':'#00a3e0','New York Mets':'#002d72','Philadelphia Phillies':'#e81828','Washington Nationals':'#ab0003','Chicago Cubs':'#0e3386','Cincinnati Reds':'#c6011f','Milwaukee Brewers':'#12284b','Pittsburgh Pirates':'#27251f','St Louis Cardinals':'#c41e3a','Arizona Diamondbacks':'#a71930','Colorado Rockies':'#33006f','Los Angeles Dodgers':'#005a9c','San Diego Padres':'#FFC425','San Francisco Giants':'#fd5a1e'};
const whiteLogoTeams=new Set(['Philadelphia Phillies','San Francisco Giants','Cincinnati Reds','Los Angeles Dodgers','New York Yankees','St Louis Cardinals','Kansas City Royals']);
const hitters=['M. SANTOS','J. WATERS','D. KIM','R. TURNER','A. PRICE','C. MORALES','T. YOUNG','B. REED','E. COLE'],pitchers=['J. MILLER','C. REYES','D. HARRIS','S. BROWN','T. WILSON'];
const outcomes=[['ball',34,'BALL','Misses just outside the zone.'],['strike',31,'CALLED STRIKE','Paints the edge.'],['foul',14,'FOUL BALL','Fouled straight back.'],['single',5.2,'SINGLE','Lines a base hit into the outfield!'],['double',1.7,'DOUBLE','Drives it into the gap!'],['triple',.15,'TRIPLE','It gets past the outfielder!'],['homer',1.1,'HOME RUN','A towering blast over the wall!'],['groundout',7.2,'GROUND OUT','A routine grounder is handled cleanly.'],['flyout',4.5,'FLY OUT','A high fly is squeezed in the outfield.'],['popup',.8,'POP OUT','A shallow pop-up is put away.'],['hbp',.3,'HIT BY PITCH','He is clipped and takes first base.'],['error',.05,'REACHES ON ERROR','The defender cannot make the play.']];
function choose(){let n=Math.random()*100;return outcomes.find(o=>(n-=o[1])<=0)}
function makeTeamDirectory(){const teams=[];Object.entries(leagues).forEach(([league,divisions])=>Object.entries(divisions).forEach(([division,names])=>names.forEach((name,index)=>teams.push({name,league,division,index,w:0,l:0}))));return{teams,team:Object.fromEntries(teams.map(team=>[team.name,team])),days:[[]]}}
const season=makeTeamDirectory();let currentDay=0,active=null,game=null,view='division';
function logo(name){const t=season.team[name];return `Teams/${t.league}/${t.division}/${name}.png`}function short(name){return name.replace('Los Angeles ','LA ').replace('New York ','NY ').replace('San Francisco ','SF ').replace('St Louis ','STL ')}function dots(total,on,type=''){return Array.from({length:total},(_,i)=>`<i class="${i<on?'on '+type:''}"></i>`).join('')}
function scorebug(){if(!active)return;const final=active.status==='final',pitcher=game?pitchers[(game.inning-1)%pitchers.length]:'—',hitter=game?hitters[game.batter]:'—',pc=game?game.pitcherPitches:0,inning=final?'FINAL':game?`${game.half==='top'?'▲':'▼'} ${game.inning}`:'—',battingSide=game?.half==='top'?'away':'home',line=game?.batting?.[battingSide]?.[game.batter]||{h:0,ab:0},hitterLine=`${hitter} · ${line.h}-${line.ab}`;$('away-logo').src=logo(active.away);$('home-logo').src=logo(active.home);$('away-logo').alt=active.away;$('home-logo').alt=active.home;$('away-score').textContent=active.awayScore??0;$('home-score').textContent=active.homeScore??0;$('inning-label').textContent=inning;$('count-label').textContent=game?`${game.balls}-${game.strikes}`:'0-0';$('balls').innerHTML=dots(3,game?.balls||0);$('strikes').innerHTML=dots(2,game?.strikes||0);$('outs').innerHTML=dots(2,game?.outs||0,'out');[1,2,3].forEach(n=>$(`base-${n}`).classList.toggle('active',!!game?.bases[n-1]));$('away-hitter').textContent=game&&battingSide==='away'?hitterLine:'';$('home-hitter').textContent=game&&battingSide==='home'?hitterLine:'';$('away-pitcher').textContent=game&&battingSide==='home'?`${pitcher} · ${pc} P`:'';$('home-pitcher').textContent=game&&battingSide==='away'?`${pitcher} · ${pc} P`:''}
function renderSchedule(){const day=season.days[currentDay],record=team=>{const t=season.team[team];return `${t.w}-${t.l}`};$('day-label').textContent=`DAY ${currentDay+1} OF ${season.days.length}`;$('schedule-summary').textContent=`${day.filter(g=>g.status==='scheduled').length} GAMES TO PLAY · ${day.filter(g=>g.status==='live').length} LIVE · ${day.filter(g=>g.status==='final').length} FINAL`;$('daily-games').innerHTML=day.map(g=>{const sel=active===g?'selected':'',done=g.status==='final',live=g.status==='live',state=live?liveGames.get(g.id):null,awayScore=done||live?(g.awayScore??0):'—',homeScore=done||live?(g.homeScore??0):'—',awayHits=done?(g.awayHits??'—'):'—',homeHits=done?(g.homeHits??'—'):'—',label=done?'FINAL':live?`${state?.half==='top'?'TOP':'BOT'} ${state?.inning||1}`:'SCHEDULED',winner=done?(awayScore>homeScore?g.away:g.home):'',loser=done?(winner===g.away?g.home:g.away):'',winnerRoster=done?makeRoster(winner):null,loserRoster=done?makeRoster(loser):null,save=done?(g.decisions?.save??(Math.abs(awayScore-homeScore)<=3?(winnerRoster.depth?.closer||'—'):'—')):'',decision=done?`<div class="schedule-decisions"><span>W: ${g.decisions?.winner||winnerRoster.pitcher}</span><span>L: ${g.decisions?.loser||loserRoster.pitcher}</span><span>SV: ${save}</span></div>`:'';return `<article class="daily-game ${sel} ${done?'final-game':''}" data-game="${g.id}" tabindex="0" role="button" aria-label="${g.away} at ${g.home}"><header class="schedule-game-header"><strong>${label}</strong><span><b>R</b><b>H</b></span></header><div class="schedule-team"><img class="match-logo" src="${logo(g.away)}" alt=""><div><strong>${g.away}</strong><small>(${record(g.away)} · Away)</small></div><b class="schedule-score">${awayScore}</b><b class="schedule-hits">${awayHits}</b></div><div class="schedule-team"><img class="match-logo" src="${logo(g.home)}" alt=""><div><strong>${g.home}</strong><small>(${record(g.home)} · Home)</small></div><b class="schedule-score">${homeScore}</b><b class="schedule-hits">${homeHits}</b></div>${decision}</article>`}).join('');$('prev-day').disabled=currentDay===0;$('next-day').disabled=currentDay===season.days.length-1}
function sorted(list){return [...list].sort((a,b)=>b.w-a.w||a.l-b.l||a.name.localeCompare(b.name))}function row(t,i,wild=false){const n=t.w+t.l,pct=n?(t.w/n).toFixed(3).replace('0.','.'):'.000';return `<div class="standing-row"><span class="rank">${i+1}</span><span class="team-name"><img class="stand-logo" src="${logo(t.name)}" alt="">${t.name}</span><span>${t.w}</span><span>${t.l}</span>${wild?'<span class="wild">WC</span>':`<span class="pct">${pct}</span>`}</div>`}
function renderStandings(){let html='';if(view==='division'){Object.entries(leagues).forEach(([league,ds])=>Object.keys(ds).forEach(division=>{const list=sorted(season.teams.filter(t=>t.league===league&&t.division===division));html+=`<section class="standings-group"><h3>${league==='American League'?'AL':'NL'} ${division.toUpperCase()} <span style="float:right">W&nbsp;&nbsp;L&nbsp;&nbsp;PCT</span></h3>${list.map((t,i)=>row(t,i)).join('')}</section>`}))}else{['American League','National League'].forEach(league=>{const list=sorted(season.teams.filter(t=>t.league===league));html+=`<section class="standings-group"><h3>${league.toUpperCase()} <span style="float:right">W&nbsp;&nbsp;L&nbsp;&nbsp;PCT</span></h3>${list.map((t,i)=>row(t,i,i<6)).join('')}</section>`})}$('standings').innerHTML=html;document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.view===view))}
function log(text){$('play-log').innerHTML=`<div><b>${game?`${game.half==='top'?'▲':'▼'} ${game.inning}`:'GAME'}</b>${text}</div>`+$('play-log').innerHTML}
function selectGame(id){active=season.days.flat().find(g=>g.id===id);game=null;$('result').textContent=active.status==='final'?'FINAL':'GAME READY';$('description').textContent=active.status==='final'?`${active.away} ${active.awayScore}, ${active.home} ${active.homeScore}`:`${active.away} at ${active.home}. Press PLAY GAME to begin.`;$('pitch-number').textContent=`DAY ${currentDay+1} · ${active.kind}`;$('velocity').textContent='';$('play-log').innerHTML='';$('pitch-button').disabled=active.status==='final';$('pitch-button').innerHTML='<span>⚾</span> PLAY GAME <kbd>SPACE</kbd>';scorebug();renderSchedule()}
function startGame(){if(!active||active.status==='final')return;if(!game){game={inning:1,half:'top',balls:0,strikes:0,outs:0,bases:[false,false,false],batter:0,pitches:0,pitcherPitches:0,batting:{away:Array.from({length:9},()=>({h:0,ab:0})),home:Array.from({length:9},()=>({h:0,ab:0}))}};active.status='live';$('result').textContent='PLAY BALL';$('description').textContent=`${active.away} and ${active.home} are underway.`;$('pitch-number').textContent='FIRST PITCH';$('pitch-button').innerHTML='<span>⚾</span> THROW PITCH <kbd>SPACE</kbd>';log('First pitch is coming up.')}pitch()}
function runs(n){if(n)active[game.half==='top'?'awayScore':'homeScore']=(active[game.half==='top'?'awayScore':'homeScore']||0)+n}function advance(n,force=false){let r=0;for(let i=2;i>=0;i--)if(game.bases[i]){game.bases[i]=false;if(i+n>=3)r++;else game.bases[i+n]=true}if(force)game.bases[0]=true;return r}function next(){game.batter=(game.batter+1)%hitters.length;game.balls=0;game.strikes=0}
function finish(){active.status='final';const winner=active.awayScore>active.homeScore?active.away:active.home,loser=winner===active.away?active.home:active.away;season.team[winner].w++;season.team[loser].l++;$('result').textContent='FINAL';$('description').textContent=`${active.away} ${active.awayScore} · ${active.home} ${active.homeScore}`;$('pitch-number').textContent='GAME COMPLETE';$('pitch-button').disabled=true;log(`${winner} defeat ${loser}.`);scorebug();renderSchedule();renderStandings()}
function endHalf(){const top=game.half==='top';if(top&&game.inning>=9&&(active.homeScore||0)>(active.awayScore||0)){finish();return}if(!top)game.inning++;game.half=top?'bottom':'top';game.outs=0;game.bases=[false,false,false];game.balls=0;game.strikes=0;if(game.inning>9&&(active.awayScore||0)!==(active.homeScore||0)){finish();return}log(`${game.half==='top'?active.away:active.home} come to bat.`)}function out(){game.outs++;if(game.outs===3)endHalf();else next()}
function pitch(){if(!active||active.status==='final')return;if(!game){startGame();return}game.pitches++;game.pitcherPitches++;const o=choose(),mph=Math.floor(78+Math.random()*21);let label=o[2],desc=o[3],r=0;if(o[0]==='ball'){if(++game.balls===4){r=advance(1,true);runs(r);label='WALK';desc=r?'Ball four — a run scores.':'Ball four. Take your base.';next()}}else if(o[0]==='strike'||o[0]==='foul'){if(o[0]==='strike'||game.strikes<2)game.strikes++;if(game.strikes===3){label='STRIKEOUT';desc=`${hitters[game.batter]} goes down swinging.`;recordAtBat();out()}}else if(['groundout','flyout','popup'].includes(o[0])){recordAtBat();out()}else if(o[0]==='hbp'||o[0]==='error'){r=advance(1,true);runs(r);if(o[0]==='error')recordAtBat();next()}else{const n=o[0]==='single'?1:o[0]==='double'?2:o[0]==='triple'?3:4;if(n===4){r=game.bases.filter(Boolean).length+1;game.bases=[false,false,false]}else{r=advance(n);game.bases[n-1]=true}runs(r);recordAtBat(true);if(r)desc+=` ${r} run${r>1?'s':''} score${r===1?'s':''}!`;next()}if(active.status==='final')return;$('result').textContent=label;$('description').textContent=desc;$('pitch-number').textContent=`PITCH ${game.pitches}`;$('velocity').textContent=`${mph} MPH`;log(`${label}`);scorebug()}
function poisson(lambda=4.25){let l=Math.exp(-lambda),p=1,k=0;do{k++;p*=Math.random()}while(p>l);return k-1}function simulateDay(){if(game&&active?.status==='live'){alert('Finish the live game before simulating the next day.');return}season.days[currentDay].filter(g=>g.status==='scheduled').forEach(g=>{g.awayScore=poisson();g.homeScore=poisson();if(g.awayScore===g.homeScore)g.homeScore++;g.awayHits=Math.max(g.awayScore,poisson(8));g.homeHits=Math.max(g.homeScore,poisson(8));g.status='final';const w=g.awayScore>g.homeScore?g.away:g.home,l=w===g.away?g.home:g.away;season.team[w].w++;season.team[l].l++});if(currentDay<season.days.length-1)currentDay++;active=null;game=null;$('result').textContent='NEXT DAY READY';$('description').textContent='Choose any scheduled game or simulate this day.';$('pitch-number').textContent=`DAY ${currentDay+1}`;$('velocity').textContent='';$('pitch-button').disabled=true;$('play-log').innerHTML='';renderSchedule();renderStandings()}
document.addEventListener('click',e=>{const id=e.target.closest('[data-game]')?.dataset.game;if(id)selectGame(id);if(e.target.id==='next-day')simulateDay();if(e.target.id==='prev-day'&&currentDay>0){currentDay--;active=null;game=null;renderSchedule()}if(e.target.classList.contains('tab')){view=e.target.dataset.view;renderStandings()}});$('pitch-button').addEventListener('click',startGame);window.addEventListener('keydown',e=>{if(e.code==='Space'&&!['BUTTON'].includes(document.activeElement.tagName)){e.preventDefault();startGame()}});renderSchedule();renderStandings();
function hittingTable(team){const positions=['SS','2B','CF','1B','RF','3B','LF','C','DH'],runs=active?(active.away===team?(active.awayScore||0):(active.homeScore||0)):0;const body=hitters.map((name,i)=>`<tr><td class="player">${name} ${positions[i]}</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>.000</td><td>.000</td><td>.000</td></tr>`).join('');return `<article class="team-box"><h2><img src="${logo(team)}" alt="">${short(team)} Hitting</h2><table class="stat-table"><thead><tr><th>HITTERS</th><th>AB</th><th>R</th><th>H</th><th>RBI</th><th>HR</th><th>BB</th><th>K</th><th>AVG</th><th>OBP</th><th>SLG</th></tr></thead><tbody>${body}<tr class="total"><td>TEAM</td><td>0</td><td>${runs}</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>.000</td><td>.000</td><td>.000</td></tr></tbody></table></article>`}
function pitchingTable(team){const current=game?pitchers[(game.inning-1)%pitchers.length]:pitchers[0],pc=game?game.pitcherPitches:0;return `<article class="team-box"><h2><img src="${logo(team)}" alt="">${short(team)} Pitching</h2><table class="stat-table"><thead><tr><th>PITCHERS</th><th>IP</th><th>H</th><th>R</th><th>ER</th><th>BB</th><th>K</th><th>HR</th><th>PC-ST</th><th>ERA</th></tr></thead><tbody><tr><td class="player">${current}</td><td>0.0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>${pc}-0</td><td>0.00</td></tr><tr class="total"><td>TEAM</td><td>0.0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>${pc}-0</td><td>0.00</td></tr></tbody></table></article>`}
function renderBox(){const box=$('box-score'),status=$('box-status');if(!box)return;if(!active){box.innerHTML='<div class="box-empty"><div><span>LIVE BOX SCORE</span>Select a game from today’s slate to view its hitting and pitching lines.</div></div>';return}box.innerHTML=hittingTable(active.away)+hittingTable(active.home)+pitchingTable(active.away)+pitchingTable(active.home);status.textContent=active.status==='final'?'● FINAL':game?'● LIVE GAMECAST':'● GAME READY'}
window.addEventListener('DOMContentLoaded',()=>{renderBox();new MutationObserver(renderBox).observe($('legacy-game-data'),{childList:true,subtree:true,characterData:true})});document.addEventListener('click',()=>setTimeout(renderBox,0));
function paintTeamColors(){if(!active)return;const marker=active.status==='final'?'FINAL':game?`${game.half==='top'?'▲':'▼'} ${game.inning}`:'—';$('inning-label').textContent=marker;[['away',active.away],['home',active.home]].forEach(([side,team])=>{document.querySelectorAll(`.${side}-logo,.${side}-score,.${side}-detail`).forEach(cell=>cell.style.setProperty('--team-color',teamColors[team]||'#123f70'));document.querySelector(`.${side}-logo`).classList.toggle('white-mark',whiteLogoTeams.has(team))})}document.addEventListener('click',()=>setTimeout(paintTeamColors,0));window.addEventListener('keydown',()=>setTimeout(paintTeamColors,0));
teamColors['New York Yankees']='#0C2340';
function recordAtBat(hit=false){const side=game.half==='top'?'away':'home',line=game.batting[side][game.batter];line.ab++;if(hit)line.h++}

// Per-team rosters and game stat lines. Each supplied depth chart lives here,
// so clubs can be added without changing the game engine.
const teamRosters={
  'Atlanta Braves':{
    lineup:[
      {name:'Ronald Acuña Jr.',position:'RF'},
      {name:'Ozzie Albies',position:'2B'},
      {name:'Matt Olson',position:'1B'},
      {name:'Austin Riley',position:'3B'},
      {name:'Sean Murphy',position:'C'},
      {name:'Michael Harris II',position:'CF'},
      {name:'Mike Yastrzemski',position:'LF'},
      {name:'Mauricio Dubon',position:'SS'},
      {name:'Drake Baldwin',position:'DH'}
    ],
    starter:'Chris Sale',
    depth:{
      rotation:['Chris Sale','Tyler Mahle','Martin Perez','Grant Holmes','Reynaldo Lopez'],
      relievers:['Robert Suarez','Didier Fuentes','Dylan Lee','Dylan Dodd','Brent Suter'],
      closer:'Raisel Iglesias'
    }
  },
  'Boston Red Sox':{
    lineup:[
      {name:'Jarren Duran',position:'LF'},
      {name:'Ceddanne Rafaela',position:'CF'},
      {name:'Trevor Story',position:'SS'},
      {name:'Roman Anthony',position:'DH'},
      {name:'Wilyer Abreu',position:'RF'},
      {name:'Wilson Contreras',position:'1B'},
      {name:'Adley Rutschman',position:'C'},
      {name:'Nick Sogard',position:'2B'},
      {name:'Caleb Durbin',position:'3B'}
    ],
    starter:'Garrett Crochet',
    depth:{
      rotation:['Garrett Crochet','Sonny Gray','Payton Tolle','Ranger Suarez','Jake Bennett'],
      relievers:['Garrett Whitlock','Erik Miller','Tyron Guerrero','Jovani Moran','Greg Weissert'],
      closer:'Aroldis Chapman'
    }
  },
  'Arizona Diamondbacks':{
    lineup:[
      {name:'Gabriel Moreno',position:'C'},
      {name:'Pavin Smith',position:'1B'},
      {name:'Ketel Marte',position:'2B'},
      {name:'Nolan Arenado',position:'3B'},
      {name:'Geraldo Perdomo',position:'SS'},
      {name:'Lars Nootbaar',position:'LF'},
      {name:'Tim Tawa',position:'CF'},
      {name:'Corbin Carroll',position:'RF'},
      {name:'Adrian Del Castillo',position:'DH'}
    ],
    starter:'Corbin Burnes',
    depth:{
      rotation:['Corbin Burnes','Eduardo Rodriguez','Michael Soroka','Merrill Kelly','Brandon Pfaadt'],
      relievers:['Jonathan Loaisiga','Dennis Santana','Taylor Clarke','Zac Gallen','Jose Cabrera'],
      closer:'Kevin Ginkel'
    }
  },
  'Baltimore Orioles':{
    lineup:[
      {name:'Carlos Narvaez',position:'C'},
      {name:'Pete Alonso',position:'1B'},
      {name:'Blaze Alexander',position:'2B'},
      {name:'Christian Encarnacion-Strand',position:'3B'},
      {name:'Gunnar Henderson',position:'SS'},
      {name:'Luis Robert Jr.',position:'LF'},
      {name:'Colton Cowser',position:'CF'},
      {name:'Dylan Beavers',position:'RF'},
      {name:'Coby Mayo',position:'DH'}
    ],
    starter:'Trevor Rogers',
    depth:{
      rotation:['Trevor Rogers','Shane Baz','Brandon Young','Chris Bassitt','Kyle Bradish'],
      relievers:['Felix Bautista','Yennier Cano','Grant Wolfram','Cam Sanders','Josh Walker'],
      closer:'Rico Garcia'
    }
  },
  'Athletics':{
    lineup:[
      {name:'Jonah Heim',position:'C'},
      {name:'Jeff McNeil',position:'1B'},
      {name:'Donovan Walton',position:'2B'},
      {name:'Zack Gelof',position:'3B'},
      {name:'Alika Williams',position:'SS'},
      {name:'Carlos Cortes',position:'LF'},
      {name:'Henry Bolte',position:'CF'},
      {name:'Lawrence Butler',position:'RF'},
      {name:'Shea Langeliers',position:'DH'}
    ],
    starter:'Jacob Lopez',
    depth:{
      rotation:['Jacob Lopez','Jeffrey Springs','Jack Perkins','Mason Barnett','Brady Basso'],
      relievers:['Luis Medina','Scott Blewett','Chris Roycroft','Geoff Hartlieb','Yunior Tur'],
      closer:'Hogan Harris'
    }
  },
  'Chicago Cubs':{
    lineup:[
      {name:'Carson Kelly',position:'C'},
      {name:'Michael Busch',position:'1B'},
      {name:'Nico Hoerner',position:'2B'},
      {name:'Alex Bregman',position:'3B'},
      {name:'Dansby Swanson',position:'SS'},
      {name:'Ian Happ',position:'LF'},
      {name:'Pete Crow-Armstrong',position:'CF'},
      {name:'Seiya Suzuki',position:'RF'},
      {name:'Michael Conforto',position:'DH'}
    ],
    starter:'Matthew Boyd',
    depth:{
      rotation:['Matthew Boyd','Shota Imanaga','Kevin Gausman','Clay Holmes','David Peterson'],
      relievers:['Jacob Webb','Daniel Palencia','Trent Thornton','Caleb Thielbar','Edward Cabrera'],
      closer:'Ryan Zeferjahn'
    }
  },
  'Chicago White Sox':{
    lineup:[
      {name:'Kyle Teel',position:'C'},
      {name:'Munetaka Murakami',position:'1B'},
      {name:'Chase Meidroth',position:'2B'},
      {name:'Miguel Vargas',position:'3B'},
      {name:'Colson Montgomery',position:'SS'},
      {name:'Sam Antonacci',position:'LF'},
      {name:'Tristan Peters',position:'CF'},
      {name:'Braden Montgomery',position:'RF'},
      {name:'Andrew Benintendi',position:'DH'}
    ],
    starter:'Sean Burke',
    depth:{
      rotation:['Sean Burke','Davis Martin','Anthony Kay','Erick Fedde','David Sandlin'],
      relievers:['Hagen Smith','Jordan Hicks','Sean Newcomb','Huascar Brazoban','Trevor Richards'],
      closer:'Bryan Hudson'
    }
  },
  'Cincinnati Reds':{
    lineup:[
      {name:'Tyler Stephenson',position:'C'},
      {name:'Sal Stewart',position:'1B'},
      {name:'Matt McLain',position:'2B'},
      {name:"Ke'Bryan Hayes",position:'3B'},
      {name:'Elly De La Cruz',position:'SS'},
      {name:'JJ Bleday',position:'LF'},
      {name:'Carlos Jorge',position:'CF'},
      {name:'Hector Rodriguez',position:'RF'},
      {name:'Eugenio Suarez',position:'DH'}
    ],
    starter:'Andrew Abbott',
    depth:{
      rotation:['Andrew Abbott','Nick Lodolo','Brady Singer','Rhett Lowder','Brandon Williamson'],
      relievers:['Brock Burke','Graham Ashcraft','Tejay Antone','Pierce Johnson','Julian Garcia'],
      closer:'Emilio Pagan'
    }
  },
  'Cleveland Guardians':{
    lineup:[
      {name:'Patrick Bailey',position:'C'},
      {name:'Nathaniel Lowe',position:'1B'},
      {name:'Travis Bazzana',position:'2B'},
      {name:'Jose Ramirez',position:'3B'},
      {name:'Brayan Rocchio',position:'SS'},
      {name:'Angel Martinez',position:'LF'},
      {name:'Steven Kwan',position:'CF'},
      {name:'Chase DeLauter',position:'RF'},
      {name:'Jo Adell',position:'DH'}
    ],
    starter:'Parker Messick',
    depth:{
      rotation:['Parker Messick','Gavin Williams','Foster Griffin','Tanner Bibee','Joey Cantillo'],
      relievers:['Hunter Gaddis','Erik Sabrowski','Shawn Armstrong','Tim Herrin','Matt Festa'],
      closer:'Cade Smith'
    }
  },
  'Colorado Rockies':{
    lineup:[
      {name:'Hunter Goodman',position:'C'},
      {name:'TJ Rumfield',position:'1B'},
      {name:'Connor Norby',position:'2B'},
      {name:'Kyle Karros',position:'3B'},
      {name:'Ezequiel Tovar',position:'SS'},
      {name:'Jake McCarthy',position:'LF'},
      {name:'Cole Carrigg',position:'CF'},
      {name:'Mickey Moniak',position:'RF'},
      {name:'Adael Amador',position:'DH'}
    ],
    starter:'Kyle Freeland',
    depth:{
      rotation:['Kyle Freeland','Tomoyuki Sugano','Jose Quintana','Mason Adams','Ryan Feltner'],
      relievers:['Juan Mejia','Brennan Bernardino','Jaden Hill','Jimmy Herget','Nick Frasso'],
      closer:'Jordan Romano'
    }
  },
  'Detroit Tigers':{
    lineup:[
      {name:'Dillon Dingler',position:'C'},
      {name:'Spencer Torkelson',position:'1B'},
      {name:'Hao-Yu Lee',position:'2B'},
      {name:'Kevin McGonigle',position:'3B'},
      {name:'John Peck',position:'SS'},
      {name:'Riley Greene',position:'LF'},
      {name:'Max Clark',position:'CF'},
      {name:'Brett Callahan',position:'RF'},
      {name:'Gleyber Torres',position:'DH'}
    ],
    starter:'Troy Melton',
    depth:{
      rotation:['Troy Melton','Framber Valdez','Jack Flaherty','Jackson Jobe','Keider Montero'],
      relievers:['Kyle Finnegan','Tyler Holton','Drew Sommers','Jacob Waguespack','Tyler Kinley'],
      closer:'Kenley Jansen'
    }
  },
  'Houston Astros':{
    lineup:[
      {name:'Yainer Diaz',position:'C'},
      {name:'Christian Walker',position:'1B'},
      {name:'Jose Altuve',position:'2B'},
      {name:'Isaac Paredes',position:'3B'},
      {name:'Jeremy Pena',position:'SS'},
      {name:'Taylor Trammell',position:'LF'},
      {name:'Daulton Varsho',position:'CF'},
      {name:'Cam Smith',position:'RF'},
      {name:'Yordan Alvarez',position:'DH'}
    ],
    starter:'Hunter Brown',
    depth:{
      rotation:['Hunter Brown','Peter Lambert','Hayden Wesneski','Cristian Javier','Mike Burrows'],
      relievers:['Bryan Abreu','Bennett Sousa','Enyel De Los Santos','Steven Okert','AJ Blubaugh'],
      closer:'Josh Hader'
    }
  },
  'Kansas City Royals':{
    lineup:[
      {name:'Carter Jensen',position:'C'},
      {name:'Vinnie Pasquantino',position:'1B'},
      {name:'Michael Massey',position:'2B'},
      {name:'Maikel Garcia',position:'3B'},
      {name:'Bobby Witt Jr.',position:'SS'},
      {name:'John Rave',position:'LF'},
      {name:'Kyle Isbel',position:'CF'},
      {name:'Jac Caglianone',position:'RF'},
      {name:'Salvador Perez',position:'DH'}
    ],
    starter:'Michael Wacha',
    depth:{
      rotation:['Michael Wacha','Noah Cameron','Seth Lugo','Randy Dobnak','Daniel Lynch IV'],
      relievers:['Craig Kimbrel','Alex Lange','Beck Way','Connor Thomas','Jose Cuas'],
      closer:'Steven Cruz'
    }
  },
  'Los Angeles Angels':{
    lineup:[
      {name:'Moises Ballesteros',position:'C'},
      {name:'Vaughn Grissom',position:'1B'},
      {name:'Christian Moore',position:'2B'},
      {name:'Denzer Guzman',position:'3B'},
      {name:'Zach Neto',position:'SS'},
      {name:'Wade Meckler',position:'LF'},
      {name:'Jose Siri',position:'CF'},
      {name:'Josh Lowe',position:'RF'},
      {name:'Mike Trout',position:'DH'}
    ],
    starter:'Reid Detmers',
    depth:{
      rotation:['Reid Detmers','Walbert Urena','Yusei Kikuchi','Grayson Rodriguez','George Klassen'],
      relievers:['Jose Fermin','Sam Bachman','Luke Murphy','Tayler Saucedo','Sammy Peralta'],
      closer:'Ben Joyce'
    }
  },
  'Los Angeles Dodgers':{
    lineup:[
      {name:'Will Smith',position:'C'},
      {name:'Freddie Freeman',position:'1B'},
      {name:'Tommy Edman',position:'2B'},
      {name:'Max Muncy',position:'3B'},
      {name:'Mookie Betts',position:'SS'},
      {name:'Teoscar Hernandez',position:'LF'},
      {name:'Andy Pages',position:'CF'},
      {name:'Kyle Tucker',position:'RF'},
      {name:'Shohei Ohtani',position:'DH'}
    ],
    starter:'Tarik Skubal',
    depth:{
      rotation:['Tarik Skubal','Yoshinobu Yamamoto','Blake Snell','Tyler Glasnow','Shohei Ohtani'],
      relievers:['Brock Stewart','Jack Dreyer','Evan Phillips','Alex Vesia','Roki Sasaki'],
      closer:'Edwin Diaz'
    }
  },
  'Miami Marlins':{
    lineup:[
      {name:'Joe Mack',position:'C'},
      {name:'Griffin Conine',position:'1B'},
      {name:'Xavier Edwards',position:'2B'},
      {name:'Javier Sanoja',position:'3B'},
      {name:'Otto Lopez',position:'SS'},
      {name:'Heriberto Hernandez',position:'LF'},
      {name:'Jakob Marsee',position:'CF'},
      {name:'Owen Caissie',position:'RF'},
      {name:'Kyle Stowers',position:'DH'}
    ],
    starter:'Sandy Alcantara',
    depth:{
      rotation:['Sandy Alcantara','Eury Perez','Janson Junk','Ryan Gusto','Tyler Phillips'],
      relievers:['Michael Petersen','Josh Ekness','Victor Vodnik','Jack Ralston','Cade Gibson'],
      closer:'Calvin Faucher'
    }
  },
  'Milwaukee Brewers':{
    lineup:[
      {name:'William Contreras',position:'C'},
      {name:'Jake Bauers',position:'1B'},
      {name:'Brice Turang',position:'2B'},
      {name:'Joey Ortiz',position:'3B'},
      {name:'Cooper Pratt',position:'SS'},
      {name:'Jackson Chourio',position:'LF'},
      {name:'Garrett Mitchell',position:'CF'},
      {name:'Sal Frelick',position:'RF'},
      {name:'Christian Yelich',position:'DH'}
    ],
    starter:'Jacob Misiorowski',
    depth:{
      rotation:['Jacob Misiorowski','Logan Henderson','Dustin May','Robert Gasser','Shane Drohan'],
      relievers:['Abner Uribe','Aaron Ashby','Chad Patrick','Antonio Senzatela','JoJo Romero'],
      closer:'Trevor Megill'
    }
  },
  'Minnesota Twins':{
    lineup:[
      {name:'Ryan Jeffers',position:'C'},
      {name:'Aaron Sabato',position:'1B'},
      {name:'Kody Clemens',position:'2B'},
      {name:'Brooks Lee',position:'3B'},
      {name:'Kaelen Culpepper',position:'SS'},
      {name:'Emmanuel Rodriguez',position:'LF'},
      {name:'Walker Jenkins',position:'CF'},
      {name:'Luke Keaschall',position:'RF'},
      {name:'Josh Bell',position:'DH'}
    ],
    starter:'Joe Ryan',
    depth:{
      rotation:['Joe Ryan','Taj Bradley','Dean Kremer','Zebby Matthews','Connor Prielipp'],
      relievers:['A.J. Minter','Andrew Morris','Taylor Rogers','Travis Adams','Tommy Nance'],
      closer:'Yoendrys Gomez'
    }
  },
  'New York Mets':{
    lineup:[
      {name:'Francisco Alvarez',position:'C'},
      {name:'Brett Baty',position:'1B'},
      {name:'Marcus Semien',position:'2B'},
      {name:'Bo Bichette',position:'3B'},
      {name:'Francisco Lindor',position:'SS'},
      {name:'Juan Soto',position:'LF'},
      {name:'A.J. Ewing',position:'CF'},
      {name:'Carson Benge',position:'RF'},
      {name:'Mark Vientos',position:'DH'}
    ],
    starter:'Nolan McLean',
    depth:{
      rotation:['Nolan McLean','Zach Thornton','Sean Manaea','Jonah Tong','Justin Hagenman'],
      relievers:['Nate Lavender','Dedniel Nunez','Daniel Duarte','Cionel Perez','Austin Warren'],
      closer:'Devin Williams'
    }
  },
  'New York Yankees':{
    lineup:[
      {name:'Austin Wells',position:'C'},
      {name:'Luis Garcia Jr.',position:'1B'},
      {name:'Jazz Chisholm Jr.',position:'2B'},
      {name:'Ryan McMahon',position:'3B'},
      {name:'George Lombard Jr.',position:'SS'},
      {name:'Cody Bellinger',position:'LF'},
      {name:'Spencer Jones',position:'CF'},
      {name:'Aaron Judge',position:'RF'},
      {name:'Ben Rice',position:'DH'}
    ],
    starter:'Cam Schlittler',
    depth:{
      rotation:['Cam Schlittler','Max Fried','Gerrit Cole','Carlos Rodon','Will Warren'],
      relievers:['Brent Headrick','Paul Blackburn','Tim Hill','Fernando Cruz','Ryan Yarbrough'],
      closer:'David Bednar'
    }
  },
  'Philadelphia Phillies':{
    lineup:[
      {name:'J.T. Realmuto',position:'C'},
      {name:'Bryce Harper',position:'1B'},
      {name:'Luis Arraez',position:'2B'},
      {name:'Bryson Stott',position:'3B'},
      {name:'Trea Turner',position:'SS'},
      {name:'Brandon Marsh',position:'LF'},
      {name:'Justin Crawford',position:'CF'},
      {name:'Bryan De La Cruz',position:'RF'},
      {name:'Kyle Schwarber',position:'DH'}
    ],
    starter:'Cristopher Sanchez',
    depth:{
      rotation:['Cristopher Sanchez','Zack Wheeler','Jesus Luzardo','Aaron Nola','Andrew Painter'],
      relievers:['Jose Alvarado','Alex McFarlane','Brooks Raley','Jonathan Bowlan','Tim Mayza'],
      closer:'Jhoan Duran'
    }
  },
  'Pittsburgh Pirates':{
    lineup:[
      {name:'Rafael Flores Jr.',position:'C'},
      {name:'Spencer Horwitz',position:'1B'},
      {name:'Brandon Lowe',position:'2B'},
      {name:'Nick Gonzales',position:'3B'},
      {name:'Konnor Griffin',position:'SS'},
      {name:'Bryan Reynolds',position:'LF'},
      {name:'Oneil Cruz',position:'CF'},
      {name:'Esmerlyn Valdez',position:'RF'},
      {name:"Ryan O'Hearn",position:'DH'}
    ],
    starter:'Paul Skenes',
    depth:{
      rotation:['Paul Skenes','Jared Jones','Bubba Chandler','Mitch Keller','Braxton Ashcraft'],
      relievers:['Luke Weaver','Kirby Yates','Yohan Ramirez','Lake Bachar','Carmen Mlodzinski'],
      closer:'Mason Montgomery'
    }
  },
  'San Diego Padres':{
    lineup:[
      {name:'Ethan Salas',position:'C'},
      {name:'Ty France',position:'1B'},
      {name:'Jake Cronenworth',position:'2B'},
      {name:'Manny Machado',position:'3B'},
      {name:'Xander Bogaerts',position:'SS'},
      {name:'Dustin Harris',position:'LF'},
      {name:'Jackson Merrill',position:'CF'},
      {name:'Fernando Tatis Jr.',position:'RF'},
      {name:'Luis Campusano',position:'DH'}
    ],
    starter:'Michael King',
    depth:{
      rotation:['Michael King','Nick Pivetta','Casey Mize','Robbie Ray','Walker Buehler'],
      relievers:['Adrian Morejon','Jason Adam','Bradley Rodriguez','Jeremiah Estrada','Wandy Peralta'],
      closer:'Mason Miller'
    }
  },
  'San Francisco Giants':{
    lineup:[
      {name:'Blake Savanaugh',position:'C'},
      {name:'Brett Harris',position:'1B'},
      {name:'Jonah Cox',position:'2B'},
      {name:'Shay Whitcomb',position:'3B'},
      {name:'Willy Adames',position:'SS'},
      {name:'Bo Davidson',position:'LF'},
      {name:'Drew Gilbert',position:'CF'},
      {name:'Jung Hoo Lee',position:'RF'},
      {name:'Marcelo Mayer',position:'DH'}
    ],
    starter:'Anthony Molina',
    depth:{
      rotation:['Anthony Molina','Matt Wilkinson','Logan Webb','Landen Roupp','Adrian Houser'],
      relievers:['Carson Seymour','Sam Hentges','JT Brubaker','Jason Foley','Camilo Doval'],
      closer:'Dylan Smith'
    }
  },
  'Seattle Mariners':{
    lineup:[
      {name:'Cal Raleigh',position:'C'},
      {name:'Josh Naylor',position:'1B'},
      {name:'Cole Young',position:'2B'},
      {name:'Brendan Donovan',position:'3B'},
      {name:'J.P. Crawford',position:'SS'},
      {name:'Randy Arozarena',position:'LF'},
      {name:'Julio Rodriguez',position:'CF'},
      {name:'Lazaro Montes',position:'RF'},
      {name:'Dominic Canzone',position:'DH'}
    ],
    starter:'Logan Gilbert',
    depth:{
      rotation:['Logan Gilbert','Bryan Woo','George Kirby','Emerson Hancock','Kade Anderson'],
      relievers:['Jose Ferrer','Seranthony Dominguez','Carlos Vargas','Michael Rucker','Cooper Criswell'],
      closer:'Gabe Speier'
    }
  },
  'St Louis Cardinals':{
    lineup:[
      {name:'Leo Bernal',position:'C'},
      {name:'Alec Burleson',position:'1B'},
      {name:'JJ Wetherholt',position:'2B'},
      {name:'Thomas Saggese',position:'3B'},
      {name:'Masyn Winn',position:'SS'},
      {name:'Bryan Torres',position:'LF'},
      {name:'Nathan Church',position:'CF'},
      {name:'Jordan Walker',position:'RF'},
      {name:'Ivan Herrera',position:'DH'}
    ],
    starter:'Michael McGreevy',
    depth:{
      rotation:['Michael McGreevy','Matthew Liberatore','Kyle Leahy','Andre Pallante','Quinn Mathews'],
      relievers:['Ryne Stanek','Justin Bruhl','Luis Gastelum','Gordon Graceffo','Cade Winquest'],
      closer:"Riley O'Brien"
    }
  },
  'Tampa Bay Rays':{
    lineup:[
      {name:'Liam Hicks',position:'C'},
      {name:'Jonathan Aranda',position:'1B'},
      {name:'Richie Palacios',position:'2B'},
      {name:'Junior Caminero',position:'3B'},
      {name:'Taylor Walls',position:'SS'},
      {name:'Chandler Simpson',position:'LF'},
      {name:'Jonny DeLuca',position:'CF'},
      {name:'Victor Mesa',position:'RF'},
      {name:'Yandy Diaz',position:'DH'}
    ],
    starter:'Drew Rasmussen',
    depth:{
      rotation:['Drew Rasmussen','Shane McClanahan','Freddy Peralta','Nick Martinez','Griffin Jax'],
      relievers:['Tyler Wells','Garrett Cleavinger','Kevin Kelly','Cam Booser','Manuel Rodriguez'],
      closer:'Bryan Baker'
    }
  },
  'Texas Rangers':{
    lineup:[
      {name:'Danny Jansen',position:'C'},
      {name:'Jake Burger',position:'1B'},
      {name:'Ezequiel Duran',position:'2B'},
      {name:'Josh Jung',position:'3B'},
      {name:'Corey Seager',position:'SS'},
      {name:'Wyatt Langford',position:'LF'},
      {name:'Evan Carter',position:'CF'},
      {name:'Brandon Nimmo',position:'RF'},
      {name:'Joc Pederson',position:'DH'}
    ],
    starter:'Jacob deGrom',
    depth:{
      rotation:['Jacob deGrom','Nathan Eovaldi','MacKenzie Gore','Kumar Rocker','Cody Bradford'],
      relievers:['Chase Silseth','Tyler Alexander','Jakob Junis','Robert Garcia','Peyton Gray'],
      closer:'Jacob Latz'
    }
  },
  'Toronto Blue Jays':{
    lineup:[
      {name:'Alejandro Kirk',position:'C'},
      {name:'Vladimir Guerrero Jr.',position:'1B'},
      {name:'Ernie Clement',position:'2B'},
      {name:'Kazuma Okamoto',position:'3B'},
      {name:'Andres Gimenez',position:'SS'},
      {name:'Josh Smith',position:'LF'},
      {name:'Brett Bateman',position:'CF'},
      {name:'Nathan Lukes',position:'RF'},
      {name:'George Springer',position:'DH'}
    ],
    starter:'Dylan Cease',
    depth:{
      rotation:['Dylan Cease','Trey Yesavage','Jose Soriano','Max Scherzer','Shane Bieber'],
      relievers:['Tyler Rogers','Braydon Fisher','Spencer Miles','Mason Fluharty','Brendon Little'],
      closer:'Louis Varland'
    }
  },
  'Washington Nationals':{
    lineup:[
      {name:'Keibert Ruiz',position:'C'},
      {name:'Abimelec Ortiz',position:'1B'},
      {name:'CJ Abrams',position:'2B'},
      {name:'Brady House',position:'3B'},
      {name:'Nasim Nunez',position:'SS'},
      {name:'Daylen Lile',position:'LF'},
      {name:'Jacob Young',position:'CF'},
      {name:'Dylan Crews',position:'RF'},
      {name:'James Wood',position:'DH'}
    ],
    starter:'Cade Cavalli',
    depth:{
      rotation:['Cade Cavalli','Connelly Early','Andrew Alvarez','Jake Irvin','DJ Herz'],
      relievers:['Richard Lovalady','Orlando Ribalta','Brad Lord','Will Dion','Riley Cornelio'],
      closer:'Erik Tolman'
    }
  }
}
function teamSeed(name){return [...name].reduce((sum,char)=>sum+char.charCodeAt(0),0)}
function hitterProfile(team,player){const line=seasonStats?.batting?.[`${team}:${player.name}`],pa=(line?.ab||0)+(line?.bb||0);if(!pa)return{obp:0,slg:0,ops:0,pa:0};const obp=((line.h||0)+(line.bb||0))/pa,slg=((line.h||0)+(line.hr||0)*3)/(line.ab||1);return{obp,slg,ops:obp+slg,pa}}
function optimizedLineup(team,lineup){const profiles=lineup.map(player=>({player,...hitterProfile(team,player)}));if(!profiles.some(profile=>profile.pa))return lineup;const remaining=[...profiles],take=stat=>{remaining.sort((a,b)=>b[stat]-a[stat]||b.pa-a.pa);return remaining.shift().player},cleanup=take('slg'),ordered=[take('obp'),take('obp'),take('ops'),cleanup];while(remaining.length)ordered.push(take('ops'));return ordered}
function makeRoster(team){const supplied=teamRosters[team];if(supplied){const rotation=supplied.depth?.rotation||[supplied.starter],teamGames=season.days.flat().filter(match=>match.away===team||match.home===team),gameNumber=active?teamGames.findIndex(match=>match.id===active.id):(season.team[team]?.w||0)+(season.team[team]?.l||0),pitcher=rotation[(gameNumber<0?0:gameNumber)%rotation.length],lineup=optimizedLineup(team,supplied.lineup);return{hitters:lineup.map(player=>player.name),positions:lineup.map(player=>player.position),pitcher,depth:supplied.depth}}const seed=teamSeed(team),tag=team.split(' ').map(word=>word[0]).join('');return{hitters:Array.from({length:9},(_,i)=>hitters[(i+seed)%hitters.length]),pitcher:`${pitchers[seed%pitchers.length]} · ${tag}`}}
function blankBatter(){return{ab:0,r:0,h:0,rbi:0,hr:0,bb:0,k:0}}
function blankPitcher(){return{pitches:0,strikes:0,outs:0,h:0,r:0,er:0,bb:0,k:0,hr:0}}
function offense(){return game.half==='top'?'away':'home'}
function defense(){return game.half==='top'?'home':'away'}
function batterIndex(){return game.batterIndex[offense()]}
function batterLine(){return game.batting[offense()][batterIndex()]}
function plate({hit=false,walk=false,strikeout=false,homeRun=false,rbi=0}={}){const line=batterLine();if(!walk){line.ab++;if(hit)line.h++;if(homeRun)line.hr++}if(walk)line.bb++;if(strikeout)line.k++;line.rbi+=rbi;return line}
function creditRun(runner){if(runner&&runner.side&&game.batting[runner.side]?.[runner.index])game.batting[runner.side][runner.index].r++}
function advance(n,force=false,newRunner=null){let scored=0;for(let i=2;i>=0;i--){const runner=game.bases[i];if(runner){game.bases[i]=false;if(i+n>=3){scored++;creditRun(runner)}else game.bases[i+n]=runner}}if(force)game.bases[0]=newRunner;return scored}
function next(){const side=offense();game.batterIndex[side]=(game.batterIndex[side]+1)%9;game.balls=0;game.strikes=0}
function startGame(){if(!active||active.status==='final')return;if(!game){const awayRoster=makeRoster(active.away),homeRoster=makeRoster(active.home);game={inning:1,half:'top',balls:0,strikes:0,outs:0,bases:[false,false,false],batterIndex:{away:0,home:0},pitches:0,rosters:{away:awayRoster,home:homeRoster},batting:{away:Array.from({length:9},blankBatter),home:Array.from({length:9},blankBatter)},pitching:{away:blankPitcher(),home:blankPitcher()}};active.status='live';$('result').textContent='PLAY BALL';$('description').textContent=`${active.away} and ${active.home} are underway.`;$('pitch-number').textContent='FIRST PITCH';$('pitch-button').innerHTML='<span>⚾</span> THROW PITCH <kbd>SPACE</kbd>';log('First pitch is coming up.')}pitch()}
function scorebug(){if(!active)return;const final=active.status==='final',batSide=game?offense():'away',defSide=game?defense():'home',idx=game?batterIndex():0,rosters=game?.rosters||{away:makeRoster(active.away),home:makeRoster(active.home)},line=game?.batting?.[batSide]?.[idx]||blankBatter(),pitch=game?.pitching?.[defSide]||blankPitcher(),inning=final?'FINAL':game?`${game.half==='top'?'▲':'▼'} ${game.inning}`:'—',hitterText=`${rosters[batSide].hitters[idx]} · ${line.h}-${line.ab}`,pitcherText=`${rosters[defSide].pitcher} · ${pitch.pitches} P`;$('away-logo').src=logo(active.away);$('home-logo').src=logo(active.home);$('away-logo').alt=active.away;$('home-logo').alt=active.home;$('away-score').textContent=active.awayScore??0;$('home-score').textContent=active.homeScore??0;$('inning-label').textContent=inning;$('count-label').textContent=game?`${game.balls}-${game.strikes}`:'0-0';$('balls').innerHTML=dots(3,game?.balls||0);$('strikes').innerHTML=dots(2,game?.strikes||0);$('outs').innerHTML=dots(2,game?.outs||0,'out');[1,2,3].forEach(n=>$(`base-${n}`).classList.toggle('active',!!game?.bases[n-1]));$('away-hitter').textContent=game&&batSide==='away'?hitterText:'';$('home-hitter').textContent=game&&batSide==='home'?hitterText:'';$('away-pitcher').textContent=game&&defSide==='away'?pitcherText:'';$('home-pitcher').textContent=game&&defSide==='home'?pitcherText:''}
function endHalf(){const top=game.half==='top';if(top&&game.inning>=9&&(active.homeScore||0)>(active.awayScore||0)){finish();return}if(!top)game.inning++;game.half=top?'bottom':'top';game.outs=0;game.bases=[false,false,false];game.balls=0;game.strikes=0;if(game.inning>9&&(active.awayScore||0)!==(active.homeScore||0)){finish();return}log(`${game.half==='top'?active.away:active.home} come to bat.`)}
function out(){game.outs++;next();if(game.outs===3)endHalf()}
function pitch(){if(!active||active.status==='final')return;if(!game){startGame();return}const def=defense(),pit=game.pitching[def],off=offense(),idx=batterIndex(),runner={side:off,index:idx};game.pitches++;pit.pitches++;const o=choose(),mph=Math.floor(78+Math.random()*21);let label=o[2],desc=o[3],r=0;if(o[0]==='ball'){if(++game.balls===4){r=advance(1,true,runner);runs(r);plate({walk:true,rbi:r});pit.bb++;label='WALK';desc=r?'Ball four — a run scores.':'Ball four. Take your base.';next()}}else if(o[0]==='strike'||o[0]==='foul'){if(o[0]==='strike'||game.strikes<2)game.strikes++;pit.strikes++;if(game.strikes===3){label='STRIKEOUT';desc=`${game.rosters[off].hitters[idx]} goes down swinging.`;plate({strikeout:true});pit.k++;pit.outs++;out()}}else if(['groundout','flyout','popup'].includes(o[0])){plate();pit.outs++;out()}else if(o[0]==='hbp'||o[0]==='error'){r=advance(1,true,runner);runs(r);if(o[0]==='error')plate();next()}else{const n=o[0]==='single'?1:o[0]==='double'?2:o[0]==='triple'?3:4;if(n===4){r=game.bases.filter(Boolean).length+1;game.bases.filter(Boolean).forEach(creditRun);game.bases=[false,false,false];game.batting[off][idx].r++}else{r=advance(n,false);game.bases[n-1]=runner}runs(r);plate({hit:true,homeRun:n===4,rbi:r});pit.h++;pit.r+=r;pit.er+=r;if(n===4)pit.hr++;if(r)desc+=` ${r} run${r>1?'s':''} score${r===1?'s':''}!`;next()}if(active.status==='final')return;$('result').textContent=label;$('description').textContent=desc;$('pitch-number').textContent=`PITCH ${game.pitches}`;$('velocity').textContent=`${mph} MPH`;log(`${label}`);scorebug();renderBox()}
function avg(line){return line.ab?(line.h/line.ab).toFixed(3).replace('0.','.'):'.000'}
function hittingTable(team){const side=active?.away===team?'away':'home',roster=game?.rosters?.[side]||makeRoster(team),stats=game?.batting?.[side]||Array.from({length:9},blankBatter),positions=roster.positions||['SS','2B','CF','1B','RF','3B','LF','C','DH'],totals=stats.reduce((sum,line)=>{Object.keys(sum).forEach(key=>sum[key]+=line[key]||0);return sum},blankBatter()),body=roster.hitters.map((name,i)=>{const s=stats[i];return `<tr><td class="player">${name} ${positions[i]}</td><td>${s.ab}</td><td>${s.r}</td><td>${s.h}</td><td>${s.rbi}</td><td>${s.hr}</td><td>${s.bb}</td><td>${s.k}</td><td>${avg(s)}</td><td>${avg({h:s.h,ab:s.ab+s.bb})}</td><td>${s.ab?((s.h+s.hr*3)/s.ab).toFixed(3).replace('0.','.'):'.000'}</td></tr>`}).join('');return `<article class="team-box"><h2><img src="${logo(team)}" alt="">${short(team)} Hitting</h2><table class="stat-table"><thead><tr><th>HITTERS</th><th>AB</th><th>R</th><th>H</th><th>RBI</th><th>HR</th><th>BB</th><th>K</th><th>AVG</th><th>OBP</th><th>SLG</th></tr></thead><tbody>${body}<tr class="total"><td>TEAM</td><td>${totals.ab}</td><td>${totals.r}</td><td>${totals.h}</td><td>${totals.rbi}</td><td>${totals.hr}</td><td>${totals.bb}</td><td>${totals.k}</td><td>${avg(totals)}</td><td>${avg({h:totals.h,ab:totals.ab+totals.bb})}</td><td>—</td></tr></tbody></table></article>`}
function ip(outs){return `${Math.floor(outs/3)}.${outs%3}`}function pitchingTable(team){const side=active?.away===team?'away':'home',roster=game?.rosters?.[side]||makeRoster(team),s=game?.pitching?.[side]||blankPitcher(),era=s.outs?(s.er*27/s.outs).toFixed(2):'0.00';return `<article class="team-box"><h2><img src="${logo(team)}" alt="">${short(team)} Pitching</h2><table class="stat-table"><thead><tr><th>PITCHERS</th><th>IP</th><th>H</th><th>R</th><th>ER</th><th>BB</th><th>K</th><th>HR</th><th>PC-ST</th><th>ERA</th></tr></thead><tbody><tr><td class="player">${roster.pitcher}</td><td>${ip(s.outs)}</td><td>${s.h}</td><td>${s.r}</td><td>${s.er}</td><td>${s.bb}</td><td>${s.k}</td><td>${s.hr}</td><td>${s.pitches}-${s.strikes}</td><td>${era}</td></tr><tr class="total"><td>TEAM</td><td>${ip(s.outs)}</td><td>${s.h}</td><td>${s.r}</td><td>${s.er}</td><td>${s.bb}</td><td>${s.k}</td><td>${s.hr}</td><td>${s.pitches}-${s.strikes}</td><td>${era}</td></tr></tbody></table></article>`}

// Pitching changes: effectiveness determines how long a pitcher can work.
function blankPitcher(name='—',role='starter'){return{name,role,pitches:0,strikes:0,outs:0,h:0,r:0,er:0,bb:0,k:0,hr:0}}
function obp(line){const pa=line.ab+line.bb;return pa?((line.h+line.bb)/pa).toFixed(3).replace('0.','.'):'.000'}
function hittingTable(team){const side=active?.away===team?'away':'home',roster=game?.rosters?.[side]||makeRoster(team),stats=game?.batting?.[side]||Array.from({length:9},blankBatter),positions=roster.positions||['SS','2B','CF','1B','RF','3B','LF','C','DH'],totals=stats.reduce((sum,line)=>{Object.keys(sum).forEach(key=>sum[key]+=line[key]||0);return sum},blankBatter()),body=roster.hitters.map((name,i)=>{const s=stats[i];return `<tr><td class="player">${name} ${positions[i]}</td><td>${s.ab}</td><td>${s.r}</td><td>${s.h}</td><td>${s.rbi}</td><td>${s.hr}</td><td>${s.bb}</td><td>${s.k}</td><td>${avg(s)}</td><td>${obp(s)}</td><td>${s.ab?((s.h+s.hr*3)/s.ab).toFixed(3).replace('0.','.'):'.000'}</td></tr>`}).join('');return `<article class="team-box"><h2><img src="${logo(team)}" alt="">${short(team)} Hitting</h2><table class="stat-table"><thead><tr><th>HITTERS</th><th>AB</th><th>R</th><th>H</th><th>RBI</th><th>HR</th><th>BB</th><th>K</th><th>AVG</th><th>OBP</th><th>SLG</th></tr></thead><tbody>${body}<tr class="total"><td>TEAM</td><td>${totals.ab}</td><td>${totals.r}</td><td>${totals.h}</td><td>${totals.rbi}</td><td>${totals.hr}</td><td>${totals.bb}</td><td>${totals.k}</td><td>${avg(totals)}</td><td>${obp(totals)}</td><td>—</td></tr></tbody></table></article>`}
function renderBox(){const box=$('box-score'),status=$('box-status');if(!box)return;if(!active){box.innerHTML='<div class="box-empty"><div><span>LIVE BOX SCORE</span>Select a game from today’s slate to view its hitting and pitching lines.</div></div>';return}const awayScore=active.awayScore??0,homeScore=active.homeScore??0,decision=active.status==='final'&&active.decisions?`<section class="final-summary"><span>FINAL</span><strong>${active.away} ${awayScore} · ${active.home} ${homeScore}</strong><div>W: ${active.decisions.winner} &nbsp;·&nbsp; L: ${active.decisions.loser}${active.decisions.save?` &nbsp;·&nbsp; SV: ${active.decisions.save}`:''}</div></section>`:'';box.innerHTML=decision+hittingTable(active.away)+hittingTable(active.home)+pitchingTable(active.away)+pitchingTable(active.home);status.textContent=active.status==='final'?'● FINAL':game?'● LIVE GAMECAST':'● GAME READY'}
function teamScore(side){return active?.[side==='away'?'awayScore':'homeScore']||0}
function runs(n){if(!n)return;const batting=offense(),pitching=defense(),leadBefore=teamScore(batting)-teamScore(pitching);active[batting==='away'?'awayScore':'homeScore']=teamScore(batting)+n;const leadAfter=teamScore(batting)-teamScore(pitching);if(leadBefore<=0&&leadAfter>0){game.decisions.winningPitcher=currentPitcher(batting).name;game.decisions.losingPitcher=currentPitcher(pitching).name}}
function finish(){active.status='final';const winner=active.awayScore>active.homeScore?active.away:active.home,loser=winner===active.away?active.home:active.away,winnerSide=winner===active.away?'away':'home',loserSide=winnerSide==='away'?'home':'away',winningPitcher=game?.decisions?.winningPitcher||currentPitcher(winnerSide).name,losingPitcher=game?.decisions?.losingPitcher||currentPitcher(loserSide).name,finisher=currentPitcher(winnerSide),save=finisher.role!=='starter'&&finisher.enteredWithLead>=1&&finisher.enteredWithLead<=3?finisher.name:null;active.decisions={winner:winningPitcher,loser:losingPitcher,save};season.team[winner].w++;season.team[loser].l++;$('result').textContent='FINAL';$('description').textContent=`${active.away} ${active.awayScore} · ${active.home} ${active.homeScore}  |  W: ${winningPitcher} · L: ${losingPitcher}${save?` · SV: ${save}`:''}`;$('pitch-number').textContent='GAME COMPLETE';$('pitch-button').disabled=true;log(`${winner} defeat ${loser}. W: ${winningPitcher} · L: ${losingPitcher}${save?` · SV: ${save}`:''}`);scorebug();renderSchedule();renderStandings();renderBox()}
function currentPitcher(side){const staff=game?.pitching?.[side];return Array.isArray(staff)?staff[game.pitcherIndex[side]]:staff||blankPitcher()}
function finish(){active.awayScore??=0;active.homeScore??=0;active.awayHits=game?.batting?.away?.reduce((total,line)=>total+line.h,0)??active.awayHits??0;active.homeHits=game?.batting?.home?.reduce((total,line)=>total+line.h,0)??active.homeHits??0;active.status='final';const winner=active.awayScore>active.homeScore?active.away:active.home,loser=winner===active.away?active.home:active.away,winnerSide=winner===active.away?'away':'home',loserSide=winnerSide==='away'?'home':'away',winningPitcher=game?.decisions?.winningPitcher||currentPitcher(winnerSide).name,losingPitcher=game?.decisions?.losingPitcher||currentPitcher(loserSide).name,winningStaff=game?.pitching?.[winnerSide]||[],finisher=winningStaff[winningStaff.length-1]||currentPitcher(winnerSide),save=finisher.role!=='starter'&&finisher.enteredWithLead>=1&&finisher.enteredWithLead<=3?finisher.name:'';active.decisions={winner:winningPitcher,loser:losingPitcher,save};season.team[winner].w++;season.team[loser].l++;$('result').textContent='FINAL';$('description').textContent=`${active.away} ${active.awayScore} · ${active.home} ${active.homeScore}  |  W: ${winningPitcher} · L: ${losingPitcher}${save?` · SV: ${save}`:''}`;$('pitch-number').textContent='GAME COMPLETE';$('pitch-button').disabled=true;log(`${winner} defeat ${loser}. W: ${winningPitcher} · L: ${losingPitcher}${save?` · SV: ${save}`:''}`);scorebug();renderSchedule();renderStandings();renderBox()}
function shuffle(list){return [...list].sort(()=>Math.random()-.5)}
function bullpenNames(side){const depth=game.rosters[side].depth||{},seed=teamSeed(side==='away'?active.away:active.home),fallback=pitchers.map((name,i)=>`${name} · RP${(seed+i)%9+1}`);return{relievers:game.bullpenOrder?.[side]||shuffle(depth.relievers||fallback),closer:depth.closer||`${pitchers[(seed+3)%pitchers.length]} · CL`}}
function pitcherLimit(pitcher){const maximum=pitcher.role==='starter'?110:30,minimum=pitcher.role==='starter'?(pitcher.er<=3?98:55):12,damage=pitcher.h*2+pitcher.bb*3+pitcher.r*6;return Math.max(minimum,maximum-damage)}
function changePitcher(side,name,role){const pitcher=blankPitcher(name,role);pitcher.enteredWithLead=teamScore(side)-teamScore(side==='away'?'home':'away');game.pitching[side].push(pitcher);game.pitcherIndex[side]=game.pitching[side].length-1;log(`${name} enters from the bullpen.`)}
function managePitcher(side){if(!game||active.status==='final')return;const current=currentPitcher(side),bullpen=bullpenNames(side),used=game.pitching[side].map(p=>p.name),closerAvailable=!used.includes(bullpen.closer),ninthOrLater=game.inning>=9,lead=teamScore(side)-teamScore(side==='away'?'home':'away'),saveOpportunity=lead>0&&lead<=3;if(ninthOrLater&&saveOpportunity&&closerAvailable){changePitcher(side,bullpen.closer,'closer');return}if(current.pitches<pitcherLimit(current))return;const reliever=bullpen.relievers.find(name=>!used.includes(name));if(reliever)changePitcher(side,reliever,'reliever')}
function startSingleGame(){if(!active||active.status==='final')return;if(!game){const awayRoster=makeRoster(active.away),homeRoster=makeRoster(active.home),awayStarter=blankPitcher(awayRoster.pitcher,'starter'),homeStarter=blankPitcher(homeRoster.pitcher,'starter');awayStarter.enteredWithLead=0;homeStarter.enteredWithLead=0;game={inning:1,half:'top',balls:0,strikes:0,outs:0,bases:[false,false,false],batterIndex:{away:0,home:0},pitches:0,rosters:{away:awayRoster,home:homeRoster},batting:{away:Array.from({length:9},blankBatter),home:Array.from({length:9},blankBatter)},pitching:{away:[awayStarter],home:[homeStarter]},pitcherIndex:{away:0,home:0},bullpenOrder:{away:shuffle(awayRoster.depth?.relievers||[]),home:shuffle(homeRoster.depth?.relievers||[])},decisions:{winningPitcher:null,losingPitcher:null}};active.status='live';$('result').textContent='PLAY BALL';$('description').textContent=`${active.away} and ${active.home} are underway.`;$('pitch-number').textContent='FIRST PITCH';$('pitch-button').innerHTML='<span>⚾</span> THROW PITCH <kbd>SPACE</kbd>';log('First pitch is coming up.')}pitchSingleGame()}
function scorebug(){if(!active)return;const final=active.status==='final',batSide=game?offense():'away',defSide=game?defense():'home',idx=game?batterIndex():0,rosters=game?.rosters||{away:makeRoster(active.away),home:makeRoster(active.home)},line=game?.batting?.[batSide]?.[idx]||blankBatter(),pitch=game?currentPitcher(defSide):blankPitcher(),inning=final?'FINAL':game?`${game.half==='top'?'▲':'▼'} ${game.inning}`:'—',hitterText=`${rosters[batSide].hitters[idx]} · ${line.h}-${line.ab}`,pitcherText=`${pitch.name} · ${pitch.pitches} P`;$('away-logo').src=logo(active.away);$('home-logo').src=logo(active.home);$('away-logo').alt=active.away;$('home-logo').alt=active.home;$('away-score').textContent=active.awayScore??0;$('home-score').textContent=active.homeScore??0;$('inning-label').textContent=inning;$('count-label').textContent=game?`${game.balls}-${game.strikes}`:'0-0';$('balls').innerHTML=dots(3,game?.balls||0);$('strikes').innerHTML=dots(2,game?.strikes||0);$('outs').innerHTML=dots(2,game?.outs||0,'out');[1,2,3].forEach(n=>$(`base-${n}`).classList.toggle('active',!!game?.bases[n-1]));$('away-hitter').textContent=game&&batSide==='away'?hitterText:'';$('home-hitter').textContent=game&&batSide==='home'?hitterText:'';$('away-pitcher').textContent=game&&defSide==='away'?pitcherText:'';$('home-pitcher').textContent=game&&defSide==='home'?pitcherText:''}
function endHalf(){const top=game.half==='top';if(top&&game.inning>=9&&(active.homeScore||0)>(active.awayScore||0)){finish();return}if(!top&&game.inning>=9&&(active.awayScore||0)!==(active.homeScore||0)){finish();return}if(!top)game.inning++;game.half=top?'bottom':'top';game.outs=0;game.bases=[false,false,false];game.balls=0;game.strikes=0;managePitcher(defense());log(`${game.half==='top'?active.away:active.home} come to bat.`)}
function walkOff(){return game.half==='bottom'&&game.inning>=9&&teamScore('home')>teamScore('away')}
// A day runs as one synchronized scoreboard; the selected game is only the current view.
const liveGames=new Map();
const SAVE_KEY='nbc-baseball-sim-2026-v3',SAVE_VERSION=4;let seasonStats={batting:{},pitching:{}},activeScreen='games',battingSort='ops',pitchingSort='era',battingSortDirection='desc',pitchingSortDirection='desc',statsScope='MLB',statsPosition='ALL';
function statLine(target,source){Object.keys(source).forEach(key=>{if(typeof source[key]==='number')target[key]=(target[key]||0)+source[key]})}
function commitFinalGame(){if(active?.statsCommitted||!game)return;['away','home'].forEach(side=>{const roster=game.rosters[side],team=active[side];game.batting[side].forEach((line,index)=>{const name=roster.hitters[index],key=`${team}:${name}`,row=seasonStats.batting[key]||{name,team,pos:roster.positions?.[index]||'DH',g:0,ab:0,r:0,h:0,rbi:0,hr:0,bb:0,k:0};row.g++;statLine(row,line);seasonStats.batting[key]=row});game.pitching[side].forEach(pitcher=>{if(!pitcher.pitches)return;const key=`${team}:${pitcher.name}`,row=seasonStats.pitching[key]||{name:pitcher.name,team,role:pitcher.role==='starter'?'SP':'RP',g:0,gs:0,w:0,l:0,sv:0,outs:0,h:0,r:0,er:0,bb:0,k:0,hr:0,pitches:0};row.g++;if(pitcher.role==='starter')row.gs++;statLine(row,pitcher);if(active.decisions?.winner===pitcher.name)row.w++;if(active.decisions?.loser===pitcher.name)row.l++;if(active.decisions?.save===pitcher.name)row.sv++;seasonStats.pitching[key]=row})});active.statsCommitted=true}
function saveProgress(){try{const gameStates=season.days.flat().filter(match=>match.status!=='scheduled').map(({id,status,awayScore,homeScore,awayHits,homeHits,decisions,statsCommitted})=>({id,status,awayScore,homeScore,awayHits,homeHits,decisions,statsCommitted})),teamRecords=season.teams.map(({name,w,l})=>({name,w,l}));localStorage.setItem(SAVE_KEY,JSON.stringify({version:SAVE_VERSION,currentDay,activeId:active?.id||null,gameStates,teamRecords,liveGames:[...liveGames.entries()],seasonStats,activeScreen,battingSort,pitchingSort,battingSortDirection,pitchingSortDirection,statsScope,statsPosition}))}catch(error){console.warn('Could not save simulator progress.',error)}}
function restoreProgress(){try{const saved=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(!saved)return false;seasonStats=saved.seasonStats||seasonStats;activeScreen=saved.activeScreen||'games';battingSort=saved.battingSort||'ops';pitchingSort=saved.pitchingSort||'era';battingSortDirection=saved.battingSortDirection||'desc';pitchingSortDirection=saved.pitchingSortDirection||'desc';statsScope=saved.statsScope||'MLB';statsPosition=saved.statsPosition||'ALL';const gamesById=new Map(season.days.flat().map(match=>[match.id,match])),legacy=saved.version!==SAVE_VERSION,gameStates=legacy?(saved.season?.days||[]).flat().filter(match=>match.status!=='scheduled'):saved.gameStates||[],records=legacy?saved.season?.teams||[]:saved.teamRecords||[];gameStates.forEach(state=>{const match=gamesById.get(state.id);if(match)Object.assign(match,state)});records.forEach(record=>{const team=season.team[record.name];if(team){team.w=record.w||0;team.l=record.l||0}});currentDay=Math.min(Math.max(saved.currentDay||0,0),season.days.length-1);liveGames.clear();(saved.liveGames||[]).forEach(([id,state])=>{if(gamesById.has(id))liveGames.set(id,state)});active=saved.activeId?gamesById.get(saved.activeId)||null:null;game=active?liveGames.get(active.id)||null:null;return true}catch(error){console.warn('Could not restore simulator progress.',error);return false}}
function rate(value){return Number.isFinite(value)?value.toFixed(3).replace('0.','.'):'.000'}
function battingValue(row,key){const ab=row.ab||0,pa=ab+(row.bb||0),avg=ab?row.h/ab:0,obp=pa?(row.h+row.bb)/pa:0,slg=ab?(row.h+(row.hr||0)*3)/ab:0,singles=Math.max(0,(row.h||0)-(row.hr||0)),battingRuns=.69*(row.bb||0)+.89*singles+2.10*(row.hr||0)-.32*pa,positionRuns=({C:12.5,SS:7.5,'2B':2.5,'3B':2.5,CF:2.5,LF:-7.5,RF:-7.5,'1B':-12.5,DH:-17.5})[row.pos]||0,war=(battingRuns+positionRuns*(pa/600)+20*(pa/600))/10;return({avg,obp,slg,ops:obp+slg,war})[key]??row[key]??0}
function pitchingValue(row,key){const ip=(row.outs||0)/3,era=ip?(row.er*9/ip):0,whip=ip?((row.h+row.bb)/ip):0,k9=ip?(row.k*9/ip):0,war=((4.25-era)*ip/9+20*(ip/180))/10;return({era,whip,k9,ip,war})[key]??row[key]??0}
function renderStats(){const batting=activeScreen==='batting',rows=Object.values(batting?seasonStats.batting:seasonStats.pitching),sort=batting?battingSort:pitchingSort,direction=batting?battingSortDirection:pitchingSortDirection,value=batting?battingValue:pitchingValue,columns=batting?[['name','NAME'],['pos','POS'],['g','GP'],['ab','AB'],['r','R'],['h','H'],['avg','AVG'],['hr','HR'],['rbi','RBI'],['bb','BB'],['k','K'],['obp','OBP'],['slg','SLG'],['ops','OPS'],['war','WAR']]:[['name','NAME'],['role','POS'],['g','GP'],['gs','GS'],['w','W'],['l','L'],['sv','SV'],['ip','IP'],['h','H'],['er','ER'],['hr','HR'],['bb','BB'],['k','K'],['era','ERA'],['whip','WHIP'],['k9','K/9'],['war','WAR']];rows.sort((a,b)=>{const delta=value(b,sort)-value(a,sort);return (direction==='asc'?-delta:delta)||a.name.localeCompare(b.name)});$('stats-title').textContent=batting?'MLB Player Batting Stats 2026':'MLB Player Pitching Stats 2026';$('stats-caption').textContent=`Top 50 players · ${rows.length} tracked · simplified WAR`;const numeric=columns.filter(([key])=>key!=='name'&&key!=='pos'&&key!=='role');$('stats-sort').innerHTML=numeric.map(([key,label])=>`<button class="${sort===key?'active':''}" data-stat-sort="${key}">${label}${sort===key?(direction==='asc'?' ↑':' ↓'):''}</button>`).join('');$('stats-head').innerHTML=`<tr><th>RK</th>${columns.map(([key,label])=>`<th class="${sort===key?'sort-highlight':''}">${label}</th>`).join('')}<th>TEAM</th></tr>`;$('stats-body').innerHTML=rows.slice(0,50).map((row,index)=>`<tr><td>${index+1}</td>${columns.map(([key])=>{let out=value(row,key);if(['avg','obp','slg','ops','era','whip'].includes(key))out=rate(out);if(['k9','war'].includes(key))out=out.toFixed(1);if(key==='ip')out=`${Math.floor((row.outs||0)/3)}.${(row.outs||0)%3}`;const content=key==='name'?`<img class="leader-logo" src="${logo(row.team)}" alt="">${out}`:out;return `<td class="${sort===key?'sort-highlight':''} ${key==='name'?'leader-name':''}">${content}</td>`}).join('')}<td class="team-code">${short(row.team)}</td></tr>`).join('')||`<tr><td colspan="21">Complete games to populate season leaders.</td></tr>`}
function showScreen(screen){activeScreen=screen;const stats=$('stats-view'),games=screen==='games';stats.hidden=games;document.querySelector('.scorebug').style.display=games?'grid':'none';document.querySelector('.layout').style.display=games?'grid':'none';document.querySelectorAll('.screen-tab').forEach(button=>button.classList.toggle('active',button.dataset.screen===screen));if(!games)renderStats();saveProgress()}
function renderStats(){const batting=activeScreen==='batting',scope=$('stats-scope')?.value||statsScope,value=batting?battingValue:pitchingValue,sort=batting?battingSort:pitchingSort,direction=batting?battingSortDirection:pitchingSortDirection,columns=batting?[['name','NAME'],['pos','POS'],['g','GP'],['ab','AB'],['r','R'],['h','H'],['avg','AVG'],['hr','HR'],['rbi','RBI'],['bb','BB'],['k','K'],['obp','OBP'],['slg','SLG'],['ops','OPS'],['war','WAR']]:[['name','NAME'],['role','POS'],['g','GP'],['gs','GS'],['w','W'],['l','L'],['sv','SV'],['ip','IP'],['h','H'],['er','ER'],['hr','HR'],['bb','BB'],['k','K'],['era','ERA'],['whip','WHIP'],['k9','K/9'],['war','WAR']],select=$('stats-scope');statsScope=scope;if(select){select.innerHTML=`<option value="MLB">All MLB</option><option value="AL">American League</option><option value="NL">National League</option><optgroup label="Teams">${season.teams.map(team=>`<option value="${team.name}">${team.name}</option>`).join('')}</optgroup>`;select.value=statsScope}$('stats-title').textContent=batting?'MLB Player Batting Stats 2026':'MLB Player Pitching Stats 2026';const rows=Object.values(batting?seasonStats.batting:seasonStats.pitching).filter(row=>scope==='MLB'||(scope==='AL'||scope==='NL'?season.team[row.team]?.league===`${scope==='AL'?'American':'National'} League`:row.team===scope));rows.sort((a,b)=>{const delta=value(b,sort)-value(a,sort);return(direction==='asc'?-delta:delta)||a.name.localeCompare(b.name)});$('stats-caption').textContent=`Top 50 players · ${rows.length} tracked · simplified WAR`;const numeric=columns.filter(([key])=>!['name','pos','role'].includes(key));$('stats-sort').innerHTML=numeric.map(([key,label])=>`<button class="${sort===key?'active':''}" data-stat-sort="${key}">${label}${sort===key?(direction==='asc'?' ↑':' ↓'):''}</button>`).join('');$('stats-head').innerHTML=`<tr><th>RK</th>${columns.map(([key,label])=>`<th class="${sort===key?'sort-highlight':''}">${label}</th>`).join('')}<th>TEAM</th></tr>`;$('stats-body').innerHTML=rows.slice(0,50).map((row,index)=>`<tr><td>${index+1}</td>${columns.map(([key])=>{let out=value(row,key);if(['avg','obp','slg','ops','era','whip'].includes(key))out=rate(out);if(['k9','war'].includes(key))out=out.toFixed(1);if(key==='ip')out=`${Math.floor((row.outs||0)/3)}.${(row.outs||0)%3}`;const content=key==='name'?`<img class="leader-logo" src="${logo(row.team)}" alt="">${out}`:out;return `<td class="${sort===key?'sort-highlight':''} ${key==='name'?'leader-name':''}">${content}</td>`}).join('')}<td class="team-code">${short(row.team)}</td></tr>`).join('')||`<tr><td colspan="21">No players are tracked for this selection yet.</td></tr>`}
const renderStatsBase=renderStats;renderStats=function(){renderStatsBase();if(activeScreen!=='pitching')return;$('stats-body').querySelectorAll('tr').forEach(row=>{const eraCell=row.cells[14];if(eraCell&&eraCell.textContent!=='—')eraCell.textContent=Number(eraCell.textContent).toFixed(2)})};
function scheduledStarter(team,match){const roster=teamRosters[team],rotation=roster?.depth?.rotation||[roster?.starter||pitchers[0]],teamGames=season.days.flat().filter(game=>game.away===team||game.home===team),gameNumber=teamGames.findIndex(game=>game.id===match.id);return rotation[(gameNumber<0?0:gameNumber)%rotation.length]}
function starterPreview(team,match){const name=scheduledStarter(team,match),line=seasonStats?.pitching?.[`${team}:${name}`],ip=(line?.outs||0)/3,era=ip?(line.er*9/ip).toFixed(2):'0.00';return `${name} (${line?.w||0}-${line?.l||0}, ${era} ERA)`}
function gamesBack(team,leader){return ((leader.w-team.w)+(team.l-leader.l))/2}
function playoffStandingRow(team,index,leader,seed='',cut=false){const games=team.w+team.l,pct=games?(team.w/games).toFixed(3).replace('0.','.'):'.000',gb=gamesBack(team,leader),behind=gb?gb.toFixed(gb%1?1:0):'—';return `<div class="standing-row ${cut?'playoff-cut':''}"><span class="rank">${seed||index+1}</span><span class="team-name"><img class="stand-logo" src="${logo(team.name)}" alt="">${team.name}</span><span>${team.w}</span><span>${team.l}</span><span class="gb">${behind}</span><span class="pct">${pct}</span></div>`}
function renderStandings(){let html='';if(view==='division'){Object.entries(leagues).forEach(([league,divisions])=>Object.keys(divisions).forEach(division=>{const list=sorted(season.teams.filter(team=>team.league===league&&team.division===division)),leader=list[0];html+=`<section class="standings-group"><h3>${league==='American League'?'AL':'NL'} ${division.toUpperCase()} <span style="float:right">W&nbsp;&nbsp;L&nbsp;&nbsp;GB&nbsp;&nbsp;PCT</span></h3>${list.map((team,index)=>playoffStandingRow(team,index,leader)).join('')}</section>`}))}else{['American League','National League'].forEach(league=>{const teams=season.teams.filter(team=>team.league===league),divisionWinners=Object.values(leagues[league]).map(names=>sorted(teams.filter(team=>names.includes(team.name)))[0]).sort((a,b)=>b.w-a.w||a.l-b.l||a.name.localeCompare(b.name)),wildCards=sorted(teams.filter(team=>!divisionWinners.includes(team))),list=[...divisionWinners,...wildCards],leader=list[0];html+=`<section class="standings-group"><h3>${league==='American League'?'AL':'NL'} LEAGUE <span style="float:right">W&nbsp;&nbsp;L&nbsp;&nbsp;GB&nbsp;&nbsp;PCT</span></h3>${list.map((team,index)=>playoffStandingRow(team,index,leader,index<6?index+1:'',index===6)).join('')}</section>`})}$('standings').innerHTML=html;document.querySelectorAll('.tab').forEach(button=>button.classList.toggle('active',button.dataset.view===view))}
const renderStandingsWithColumns=renderStandings;renderStandings=function(){renderStandingsWithColumns();document.querySelectorAll('.standings-group h3 span').forEach(header=>{header.className='standing-columns';header.innerHTML='<i></i><i></i><b>W</b><b>L</b><b>GB</b><b>PCT</b>'})};
const renderScheduleWithPitchers=renderSchedule;renderSchedule=function(){renderScheduleWithPitchers();const day=season.days[currentDay]||[];day.filter(match=>match.status==='scheduled').forEach(match=>{const card=document.querySelector(`[data-game="${match.id}"]`),teams=card?.querySelectorAll('.schedule-team');if(teams?.length===2){teams[0].querySelector('.schedule-score')?.insertAdjacentHTML('beforebegin',`<span class="pitcher-preview">${starterPreview(match.away,match)}</span>`);teams[1].querySelector('.schedule-score')?.insertAdjacentHTML('beforebegin',`<span class="pitcher-preview">${starterPreview(match.home,match)}</span>`)}})};
const renderStatsWithPrecision=renderStats;renderStats=function(){renderStatsWithPrecision();const batting=activeScreen==='batting',special=batting?'pos':'role',label=batting?'POS':'SP / RP',sort=batting?battingSort:pitchingSort,direction=batting?battingSortDirection:pitchingSortDirection;$('stats-sort').insertAdjacentHTML('afterbegin',`<button class="${sort===special?'active':''}" data-stat-sort="${special}">${label}${sort===special?(direction==='asc'?' ↑':' ↓'):''}</button>`);if(sort!==special)return;const rows=[...$('stats-body').querySelectorAll('tr')],column=2;rows.sort((a,b)=>{const delta=a.cells[column].textContent.localeCompare(b.cells[column].textContent);return direction==='asc'?delta:-delta});rows.forEach((row,index)=>{row.cells[0].textContent=index+1;$('stats-body').append(row)})};
const renderStatsWithPositionControl=renderStats;renderStats=function(){renderStatsWithPositionControl();const batting=activeScreen==='batting',select=$('stats-position'),special=batting?'pos':'role';$('stats-sort').querySelector(`[data-stat-sort="${special}"]`)?.remove();if(!select)return;const options=batting?[['ALL','All Positions'],['C','Catcher'],['1B','First Base'],['2B','Second Base'],['3B','Third Base'],['SS','Shortstop'],['LF','Left Field'],['CF','Center Field'],['RF','Right Field'],['DH','Designated Hitter']]:[['ALL','All Pitchers'],['SP','Starting Pitchers'],['RP','Relief Pitchers']];select.innerHTML=options.map(([value,label])=>`<option value="${value}">${label}</option>`).join('');select.value=statsPosition;const rows=[...$('stats-body').querySelectorAll('tr')],kept=rows.filter(row=>statsPosition==='ALL'||row.cells[2]?.textContent===statsPosition);$('stats-body').replaceChildren(...kept);kept.forEach((row,index)=>row.cells[0].textContent=index+1);$('stats-caption').textContent=`Top ${kept.length} players · filtered by ${select.options[select.selectedIndex].text}`};
const renderStatsWithFilters=renderStats;renderStats=function(){const valid=activeScreen==='batting'?['ALL','C','1B','2B','3B','SS','LF','CF','RF','DH']:['ALL','SP','RP'];if(!valid.includes(statsPosition))statsPosition='ALL';renderStatsWithFilters()};
renderStats=function(){const batting=activeScreen==='batting',validPositions=batting?['ALL','C','1B','2B','3B','SS','LF','CF','RF','DH']:['ALL','SP','RP'];if(!validPositions.includes(statsPosition))statsPosition='ALL';if(batting&&battingSort==='pos')battingSort='ops';if(!batting&&pitchingSort==='role')pitchingSort='era';const scope=$('stats-scope')?.value||statsScope,position=statsPosition,value=batting?battingValue:pitchingValue,sort=batting?battingSort:pitchingSort,direction=batting?battingSortDirection:pitchingSortDirection,columns=batting?[['name','NAME'],['pos','POS'],['g','GP'],['ab','AB'],['r','R'],['h','H'],['avg','AVG'],['hr','HR'],['rbi','RBI'],['bb','BB'],['k','K'],['obp','OBP'],['slg','SLG'],['ops','OPS'],['war','WAR']]:[['name','NAME'],['role','POS'],['g','GP'],['gs','GS'],['w','W'],['l','L'],['sv','SV'],['ip','IP'],['h','H'],['er','ER'],['hr','HR'],['bb','BB'],['k','K'],['era','ERA'],['whip','WHIP'],['k9','K/9'],['war','WAR']],scopeSelect=$('stats-scope'),positionSelect=$('stats-position');statsScope=scope;if(scopeSelect){scopeSelect.innerHTML=`<option value="MLB">All MLB</option><option value="AL">American League</option><option value="NL">National League</option><optgroup label="Teams">${season.teams.map(team=>`<option value="${team.name}">${team.name}</option>`).join('')}</optgroup>`;scopeSelect.value=statsScope}if(positionSelect){const options=batting?[['ALL','All Positions'],['C','Catcher'],['1B','First Base'],['2B','Second Base'],['3B','Third Base'],['SS','Shortstop'],['LF','Left Field'],['CF','Center Field'],['RF','Right Field'],['DH','Designated Hitter']]:[['ALL','All Pitchers'],['SP','Starting Pitchers'],['RP','Relief Pitchers']];positionSelect.innerHTML=options.map(([key,label])=>`<option value="${key}">${label}</option>`).join('');positionSelect.value=position}$('stats-title').textContent=batting?'MLB Player Batting Stats 2026':'MLB Player Pitching Stats 2026';const rows=Object.values(batting?seasonStats.batting:seasonStats.pitching).filter(row=>(scope==='MLB'||(scope==='AL'||scope==='NL'?season.team[row.team]?.league===`${scope==='AL'?'American':'National'} League`:row.team===scope))&&(position==='ALL'||(batting?row.pos:row.role)===position));rows.sort((a,b)=>{const delta=value(b,sort)-value(a,sort);return(direction==='asc'?-delta:delta)||a.name.localeCompare(b.name)});$('stats-caption').textContent=`Top ${Math.min(50,rows.length)} players · ${rows.length} tracked · simplified WAR`;const numeric=columns.filter(([key])=>!['name','pos','role'].includes(key));$('stats-sort').innerHTML=numeric.map(([key,label])=>`<button class="${sort===key?'active':''}" data-stat-sort="${key}">${label}${sort===key?(direction==='asc'?' ↑':' ↓'):''}</button>`).join('');$('stats-head').innerHTML=`<tr><th>RK</th>${columns.map(([key,label])=>`<th class="${sort===key?'sort-highlight':''}">${label}</th>`).join('')}<th>TEAM</th></tr>`;$('stats-body').innerHTML=rows.slice(0,50).map((row,index)=>`<tr><td>${index+1}</td>${columns.map(([key])=>{let out=value(row,key);if(['avg','obp','slg','ops','whip'].includes(key))out=rate(out);if(key==='era')out=out.toFixed(2);if(['k9','war'].includes(key))out=out.toFixed(1);if(key==='ip')out=`${Math.floor((row.outs||0)/3)}.${(row.outs||0)%3}`;const content=key==='name'?`<img class="leader-logo" src="${logo(row.team)}" alt="">${out}`:out;return `<td class="${sort===key?'sort-highlight':''} ${key==='name'?'leader-name':''}">${content}</td>`}).join('')}<td class="team-code">${short(row.team)}</td></tr>`).join('')||`<tr><td colspan="21">No players are tracked for this selection yet.</td></tr>`};
function postseasonSeeds(league){const teams=season.teams.filter(team=>team.league===league),winners=Object.values(leagues[league]).map(names=>sorted(teams.filter(team=>names.includes(team.name)))[0]).sort((a,b)=>b.w-a.w||a.l-b.l||a.name.localeCompare(b.name));return[...winners,...sorted(teams.filter(team=>!winners.includes(team))).slice(0,3)]}
function playoffSeries(id,round,high,low,best){return{id,round,high,low,best,highWins:0,lowWins:0,winner:null}}
function homePattern(series){return series.best===3?[series.high,series.high,series.high]:series.round==='DS'?[series.high,series.high,series.low,series.low,series.high]:[series.high,series.high,series.low,series.low,series.low,series.high,series.high]}
function queuePostseasonDay(){const post=season.postseason,series=post.series.filter(item=>!item.winner),day=series.map(item=>{const number=item.highWins+item.lowWins,home=homePattern(item)[number],away=home===item.high?item.low:item.high;return{id:`post-${item.id}-${number+1}`,day:season.days.length,away,home,kind:`${item.round} · GAME ${number+1}`,status:'scheduled',postseason:true,seriesId:item.id}});if(!day.length)return false;season.days.push(day);currentDay=season.days.length-1;return true}
function startPostseason(){const al=postseasonSeeds('American League'),nl=postseasonSeeds('National League');season.postseason={round:'WC',series:[playoffSeries('AL-36','WC',al[2].name,al[5].name,3),playoffSeries('AL-45','WC',al[3].name,al[4].name,3),playoffSeries('NL-36','WC',nl[2].name,nl[5].name,3),playoffSeries('NL-45','WC',nl[3].name,nl[4].name,3)],seeds:Object.fromEntries([...al,...nl].map((team,index)=>[team.name,index%6+1]))};queuePostseasonDay()}
function recordPostseasonGame(match){if(!match?.postseason||match.postRecorded)return;const series=season.postseason?.series.find(item=>item.id===match.seriesId);if(!series)return;const winner=match.awayScore>match.homeScore?match.away:match.home;winner===series.high?series.highWins++:series.lowWins++;if(series.highWins===Math.ceil(series.best/2))series.winner=series.high;if(series.lowWins===Math.ceil(series.best/2))series.winner=series.low;match.postRecorded=true}
function nextPostseasonRound(){const post=season.postseason,winners=id=>post.series.find(series=>series.id===id)?.winner,better=(a,b)=>post.seeds[a]<post.seeds[b]?[a,b]:[b,a];if(post.round==='WC'){const al1=postseasonSeeds('American League')[0].name,al2=postseasonSeeds('American League')[1].name,nl1=postseasonSeeds('National League')[0].name,nl2=postseasonSeeds('National League')[1].name,a=better(al1,winners('AL-45')),b=better(al2,winners('AL-36')),c=better(nl1,winners('NL-45')),d=better(nl2,winners('NL-36'));post.round='DS';post.series=[playoffSeries('AL-1','DS',a[0],a[1],5),playoffSeries('AL-2','DS',b[0],b[1],5),playoffSeries('NL-1','DS',c[0],c[1],5),playoffSeries('NL-2','DS',d[0],d[1],5)]}else if(post.round==='DS'){const a=better(winners('AL-1'),winners('AL-2')),b=better(winners('NL-1'),winners('NL-2'));post.round='LCS';post.series=[playoffSeries('ALCS','LCS',a[0],a[1],7),playoffSeries('NLCS','LCS',b[0],b[1],7)]}else if(post.round==='LCS'){const a=winners('ALCS'),b=winners('NLCS'),betterTeam=sorted([season.team[a],season.team[b]])[0].name;post.round='WS';post.series=[playoffSeries('WS','WS',betterTeam===a?a:b,betterTeam===a?b:a,7)]}else if(post.round==='WS'){post.champion=winners('WS');return false}return queuePostseasonDay()}
function advancePostseason(){const post=season.postseason;if(!post)return false;if(post.series.some(series=>!series.winner))return queuePostseasonDay();return nextPostseasonRound()}
const finishWithPostseason=finish;finish=function(){finishWithPostseason();recordPostseasonGame(active)};
const saveProgressBase=saveProgress;saveProgress=function(){saveProgressBase();try{const saved=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}');if(season.postseason){saved.postseason=season.postseason;saved.postseasonDays=season.days.filter(day=>day.some(match=>match.postseason));localStorage.setItem(SAVE_KEY,JSON.stringify(saved))}}catch(error){console.warn('Could not save postseason progress.',error)}};
const restoreProgressBase=restoreProgress;restoreProgress=function(){try{const saved=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(saved?.postseasonDays?.length){season.days.push(...saved.postseasonDays);season.postseason=saved.postseason||null}}catch(error){console.warn('Could not restore postseason progress.',error)}return restoreProgressBase()};
const BET_KEY='nbc-baseball-sim-2026-bets',betOffers=new Map();let betting=JSON.parse(localStorage.getItem(BET_KEY)||'{"balance":100,"creditedWeek":0,"slip":[]}');function saveBets(){localStorage.setItem(BET_KEY,JSON.stringify(betting))}function american(prob){return Math.round(prob>=.5?-100*prob/(1-prob):100*(1-prob)/prob)}function teamProbability(team,opponent,match){const record=season.team[team],opponentRecord=season.team[opponent],pct=record.w+record.l?record.w/(record.w+record.l):.5,oppPct=opponentRecord.w+opponentRecord.l?opponentRecord.w/(opponentRecord.w+opponentRecord.l):.5,pitch=starterPreview(team,match).match(/\((\d+)-(\d+), ([\d.]+)/),oppPitch=starterPreview(opponent,match).match(/\((\d+)-(\d+), ([\d.]+)/),edge=(pct-oppPct)*.7+((oppPitch?.[3]||4.25)-(pitch?.[3]||4.25))*.035;return Math.max(.2,Math.min(.8,.5+edge))}function renderBetting(){const week=Math.floor(currentDay/7);if(week>betting.creditedWeek){betting.balance+=(week-betting.creditedWeek)*100;betting.creditedWeek=week;saveBets()}$('betting-balance').textContent=`Balance: $${betting.balance.toFixed(2)} · $100 weekly credit every 7 days`;betOffers.clear();const day=season.days[currentDay]||[];$('betting-offers').innerHTML=day.filter(match=>match.status==='scheduled'||match.status==='live').map(match=>{const awayProb=teamProbability(match.away,match.home,match),homeProb=1-awayProb,offers=[{label:`${match.away} moneyline`,odds:american(awayProb)},{label:`${match.home} moneyline`,odds:american(homeProb)},{label:'Over 8.5 runs',odds:-110},{label:'Under 8.5 runs',odds:-110},{label:`${scheduledStarter(match.away,match)} over 4.5 Ks`,odds:-115},{label:`${scheduledStarter(match.home,match)} over 4.5 Ks`,odds:-115}];return `<article class="bet-game"><h2>${match.away} at ${match.home}</h2>${offers.map((offer,index)=>{const id=`${match.id}-${index}`;betOffers.set(id,{...offer,matchId:match.id});return `<button data-bet-offer="${id}">${offer.label} <b>${offer.odds>0?'+':''}${offer.odds}</b></button>`}).join('')}</article>`}).join('')||'<p>No playable games remain today.</p>';$('bet-count').textContent=`${betting.slip.length} / 25`;$('bet-slip-legs').innerHTML=betting.slip.map((leg,index)=>`<div>${leg.label} <b>${leg.odds>0?'+':''}${leg.odds}</b><button data-remove-bet="${index}">×</button></div>`).join('')||'<p>Select up to 25 legs.</p>'}const showScreenBase=showScreen;showScreen=function(screen){if(screen!=='betting'){ $('betting-view').hidden=true;return showScreenBase(screen)}activeScreen=screen;$('stats-view').hidden=true;$('betting-view').hidden=false;document.querySelector('.scorebug').style.display='none';document.querySelector('.layout').style.display='none';document.querySelectorAll('.screen-tab').forEach(button=>button.classList.toggle('active',button.dataset.screen===screen));renderBetting()};document.addEventListener('click',event=>{const offer=event.target.closest('[data-bet-offer]')?.dataset.betOffer,remove=event.target.closest('[data-remove-bet]')?.dataset.removeBet;if(offer&&betOffers.has(offer)&&betting.slip.length<25&&!betting.slip.some(leg=>leg.id===offer)){betting.slip.push({id:offer,...betOffers.get(offer)});saveBets();renderBetting()}if(remove!==undefined){betting.slip.splice(Number(remove),1);saveBets();renderBetting()}if(event.target.id==='place-bet'){const wager=Number($('bet-wager').value);if(!betting.slip.length||wager<=0||wager>betting.balance){$('bet-message').textContent='Choose legs and enter a wager within your balance.';return}betting.balance-=wager;betting.slip=[];saveBets();$('bet-message').textContent='Parlay placed. Results settle when every leg is final.';renderBetting()}});
// Sportsbook markets and bet tracking. These are stored separately so a wager survives a page refresh.
betting.activeParlays=Array.isArray(betting.activeParlays)?betting.activeParlays:[];
function decimalOdds(odds){return odds>0?1+odds/100:1+100/Math.abs(odds)}
function formatOdds(odds){return `${odds>0?'+':''}${odds}`}
function payoutFor(legs,wager){return legs.reduce((total,leg)=>total*decimalOdds(leg.odds),wager)}
function playerBattingLine(match,team,player){const state=liveGames.get(match.id);if(!state)return null;const side=match.away===team?'away':'home',index=state.rosters?.[side]?.hitters?.indexOf(player);return index<0?null:state.batting?.[side]?.[index]||null}
function playerPitchingLine(match,team,player){const state=liveGames.get(match.id);if(!state)return null;const side=match.away===team?'away':'home';return state.pitching?.[side]?.find(pitcher=>pitcher.name===player)||null}
function betLegProgress(leg){const match=season.days.flat().find(item=>item.id===leg.matchId);if(!match)return{state:'pending',text:'Awaiting game'};const final=match.status==='final',state=liveGames.get(match.id);if(leg.type==='moneyline'){if(!final)return{state:'pending',text:match.status==='live'?'Live':'Scheduled'};const won=(leg.team===match.away?match.awayScore:match.homeScore)>(leg.team===match.away?match.homeScore:match.awayScore);return{state:won?'won':'lost',text:won?'Won':'Lost'}}if(!state)return{state:final?'pending':'pending',text:final?'Final — stat line unavailable':match.status==='live'?'Live':'Scheduled'};let line,value=0;if(leg.type==='k'){line=playerPitchingLine(match,leg.team,leg.player);value=line?.k||0}else{line=playerBattingLine(match,leg.team,leg.player);value=leg.type==='hr'?(line?.hr||0):(line?.h||0)}const won=value>=leg.threshold;return{state:final?(won?'won':'lost'):'pending',text:`${value}/${leg.threshold}${final?' · Final':''}`}}
function settleActiveParlays(){let changed=false;betting.activeParlays.forEach(parlay=>{if(parlay.settled)return;const progress=parlay.legs.map(betLegProgress);if(progress.some(item=>item.state==='lost')){parlay.settled='lost';changed=true}else if(progress.length&&progress.every(item=>item.state==='won')){parlay.settled='won';betting.balance+=parlay.payout;changed=true}});if(changed)saveBets()}
function propOdds(team,player,type,threshold){const row=seasonStats.batting?.[`${team}:${player}`]||{},ab=row.ab||0,avg=ab?row.h/ab:.255,hrRate=ab?row.hr/ab:.035;let probability=type==='hr'?Math.min(.34,Math.max(.05,hrRate*3.7)):Math.min(.90,Math.max(.08,1-Math.pow(1-avg,4)));if(type==='h')probability=threshold===1?probability:threshold===2?probability*.38:threshold===3?probability*.12:probability*.035;return american(Math.min(.86,Math.max(.025,probability)))}
function registerOffer(match,offer,index){const id=`${match.id}-${offer.type}-${offer.team||''}-${offer.player||''}-${offer.threshold||''}-${index}`;const leg={id,matchId:match.id,...offer};betOffers.set(id,leg);return `<button class="bet-pick" data-bet-offer="${id}"><span>${offer.label}</span><b>${formatOdds(offer.odds)}</b></button>`}
function renderBetSlip(){const wager=Math.max(0,Number($('bet-wager')?.value)||0),combined=betting.slip.length?betting.slip.reduce((total,leg)=>total*decimalOdds(leg.odds),1):0,payout=combined*wager;$('bet-count').textContent=`${betting.slip.length} / 25`;$('bet-slip-legs').innerHTML=betting.slip.map((leg,index)=>`<div><span>${leg.label}</span><b>${formatOdds(leg.odds)}</b><button data-remove-bet="${index}" aria-label="Remove bet">×</button></div>`).join('')||'<p>Select up to 25 legs.</p>';$('bet-slip-summary').innerHTML=betting.slip.length?`<span>Total odds <b>${combined>=2?'+':''}${combined.toFixed(2)}</b></span><span>To win <b>$${payout.toFixed(2)}</b></span>`:'';settleActiveParlays();$('active-parlays').innerHTML=betting.activeParlays.length?betting.activeParlays.slice().reverse().map(parlay=>{const progress=parlay.legs.map(betLegProgress),won=progress.filter(item=>item.state==='won').length,lost=progress.some(item=>item.state==='lost'),status=parlay.settled==='won'?'WON':parlay.settled==='lost'||lost?'LOST':`${won}/${parlay.legs.length} LEGS`;return `<article class="active-parlay ${status==='WON'?'won':status==='LOST'?'lost':''}"><header><b>${status}</b><span>$${parlay.wager.toFixed(2)} → $${parlay.payout.toFixed(2)}</span></header>${parlay.legs.map((leg,index)=>`<div><span>${leg.label}</span><em class="${progress[index].state}">${progress[index].text}</em></div>`).join('')}</article>`}).join(''):'<p>No active parlays yet.</p>'}
function renderBetting(){const week=Math.floor(currentDay/7);if(week>betting.creditedWeek){betting.balance+=(week-betting.creditedWeek)*100;betting.creditedWeek=week;saveBets()}settleActiveParlays();$('betting-balance').textContent=`Balance: $${betting.balance.toFixed(2)} · $100 weekly credit every 7 days`;betOffers.clear();const day=season.days[currentDay]||[];const propGroups=[['To Hit a Home Run','hr',1],['To Hit 2+ Home Runs','hr',2],['To Record a Hit','h',1],['To Record 2+ Hits','h',2],['To Record 3+ Hits','h',3],['To Record 4+ Hits','h',4]];$('betting-offers').innerHTML=day.filter(match=>match.status==='scheduled'||match.status==='live').map(match=>{const awayProb=teamProbability(match.away,match.home,match),homeProb=1-awayProb,players=[...makeRoster(match.away).hitters.slice(0,3).map(player=>({team:match.away,player})),...makeRoster(match.home).hitters.slice(0,3).map(player=>({team:match.home,player}))],gameLines=[{type:'moneyline',team:match.away,label:`${match.away} moneyline`,odds:american(awayProb)},{type:'moneyline',team:match.home,label:`${match.home} moneyline`,odds:american(homeProb)}];const props=propGroups.map(([title,type,threshold])=>`<details class="prop-market" ${title==='To Hit a Home Run'?'open':''}><summary>${title}</summary><div>${players.map((item,index)=>registerOffer(match,{type,team:item.team,player:item.player,threshold,label:`${item.player} ${type==='hr'?`${threshold===1?'HR':'2+ HR'}`:`${threshold===1?'Hit':`${threshold}+ Hits`}`}`,odds:propOdds(item.team,item.player,type,threshold)},index)).join('')}</div></details>`).join('');const starters=[{team:match.away,player:scheduledStarter(match.away,match)},{team:match.home,player:scheduledStarter(match.home,match)}];return `<article class="bet-game betting-market"><header class="bet-matchup"><div><img src="${logo(match.away)}" alt=""><b>${match.away}</b><small>${starterPreview(match.away,match)}</small></div><span>@</span><div><img src="${logo(match.home)}" alt=""><b>${match.home}</b><small>${starterPreview(match.home,match)}</small></div></header><section class="game-lines"><h2>Game Lines</h2>${gameLines.map((offer,index)=>registerOffer(match,offer,index)).join('')}</section><details class="prop-market" open><summary>Starting Pitcher Strikeouts</summary><div>${starters.map((item,index)=>registerOffer(match,{type:'k',team:item.team,player:item.player,threshold:5,label:`${item.player} 5+ Strikeouts`,odds:-115},index)).join('')}</div></details>${props}</article>`}).join('')||'<p>No playable games remain today.</p>';renderBetSlip()}
document.addEventListener('input',event=>{if(event.target.id==='bet-wager')renderBetSlip()});
document.addEventListener('click',event=>{const offer=event.target.closest('[data-bet-offer]')?.dataset.betOffer,remove=event.target.closest('[data-remove-bet]')?.dataset.removeBet,placing=event.target.id==='place-bet';if(!offer&&remove===undefined&&!placing)return;event.preventDefault();event.stopImmediatePropagation();if(offer&&betOffers.has(offer)){if(betting.slip.length>=25){$('bet-message').textContent='A parlay can contain up to 25 legs.'}else if(!betting.slip.some(leg=>leg.id===offer)){betting.slip.push(betOffers.get(offer));saveBets();renderBetting()}}if(remove!==undefined){betting.slip.splice(Number(remove),1);saveBets();renderBetting()}if(placing){const wager=Number($('bet-wager').value);if(!betting.slip.length||wager<=0||wager>betting.balance){$('bet-message').textContent='Choose legs and enter a wager within your balance.';return}const payout=payoutFor(betting.slip,wager);betting.balance-=wager;betting.activeParlays.push({id:`parlay-${Date.now()}`,wager,payout,legs:betting.slip.map(leg=>({...leg})),createdDay:currentDay,settled:null});betting.slip=[];saveBets();$('bet-message').textContent='Parlay placed — live progress is shown below.';renderBetting()}},true);
const renderBetSlipWithDismissBase=renderBetSlip;renderBetSlip=function(){renderBetSlipWithDismissBase();const lost=betting.activeParlays.slice().reverse().filter(parlay=>parlay.settled==='lost');document.querySelectorAll('.active-parlay.lost header').forEach((header,index)=>{const parlay=lost[index];if(!parlay)return;const button=document.createElement('button');button.type='button';button.className='dismiss-parlay';button.dataset.dismissParlay=parlay.id;button.textContent='×';button.setAttribute('aria-label','Dismiss lost parlay');header.append(button)})};
document.addEventListener('click',event=>{const id=event.target.closest('[data-dismiss-parlay]')?.dataset.dismissParlay;if(!id)return;event.preventDefault();event.stopImmediatePropagation();const parlay=betting.activeParlays.find(item=>item.id===id);if(parlay?.settled==='lost'){betting.activeParlays=betting.activeParlays.filter(item=>item.id!==id);saveBets();renderBetting()}},true);
const mlbTeamNames={'St. Louis Cardinals':'St Louis Cardinals'};
function canonicalTeam(name){return mlbTeamNames[name]||name}
function loadOfficialSchedule(){try{const saved=window.MLB_2026_SCHEDULE;if(!Array.isArray(saved))throw new Error('Saved schedule data is unavailable');const grouped=saved.reduce((days,[date,gamePk,awayName,homeName,start])=>{if(!days.has(date))days.set(date,[]);days.get(date).push({gamePk,awayName,homeName,start});return days},new Map()),days=[...grouped].map(([date,sources])=>{const games=sources.map(source=>{const away=canonicalTeam(source.awayName),home=canonicalTeam(source.homeName);if(!season.team[away]||!season.team[home])return null;return{id:`mlb-${source.gamePk}`,day:0,date,start:source.start,away,home,kind:'REGULAR SEASON',status:'scheduled'}}).filter(Boolean);games.date=date;return games}).filter(day=>day.length);if(!days.length)throw new Error('Saved schedule contains no usable regular-season games');days.forEach((day,index)=>day.forEach(game=>game.day=index));season.days=days;season.teams.forEach(team=>{team.w=0;team.l=0});currentDay=0;active=null;game=null;liveGames.clear();$('pitch-button').disabled=true;$('result').textContent='SELECT A GAME';$('description').textContent='Saved 2026 schedule loaded. Select a matchup to begin the day.';$('pitch-number').textContent='OPENING DAY';$('velocity').textContent='';$('play-log').innerHTML='';renderSchedule();renderStandings();renderBox()}catch(error){console.warn('Using the built-in schedule because the saved 2026 schedule could not be loaded.',error)}}
loadOfficialSchedule();restoreProgress();$('stats-scope').innerHTML=`<option value="MLB">All MLB</option><option value="AL">American League</option><option value="NL">National League</option><optgroup label="Teams">${season.teams.map(team=>`<option value="${team.name}">${team.name}</option>`).join('')}</optgroup>`;$('stats-scope').value=statsScope;renderSchedule();renderStandings();renderBox();
document.querySelectorAll('.screen-tab').forEach(button=>button.addEventListener('click',()=>showScreen(button.dataset.screen)));
$('stats-scope').addEventListener('change',event=>{statsScope=event.target.value;renderStats();saveProgress()});
$('stats-position').addEventListener('change',event=>{statsPosition=event.target.value;renderStats();saveProgress()});
document.addEventListener('click',event=>{const key=event.target.dataset.statSort;if(!key)return;if(activeScreen==='batting'){battingSortDirection=battingSort===key?(battingSortDirection==='desc'?'asc':'desc'):'desc';battingSort=key}else{pitchingSortDirection=pitchingSort===key?(pitchingSortDirection==='desc'?'asc':'desc'):'desc';pitchingSort=key}renderStats();saveProgress()});
showScreen(activeScreen);
function restoreViewedGame(){if(!active)return;game=liveGames.get(active.id)||null;const allFinal=season.days[currentDay].every(match=>match.status==='final');$('pitch-button').disabled=allFinal;if(!allFinal)$('pitch-button').innerHTML='<span>⚾</span> NEXT PITCH · ALL GAMES <kbd>SPACE</kbd>';scorebug();renderSchedule();renderBox();saveProgress()}
function selectGame(id){active=season.days.flat().find(match=>match.id===id);game=liveGames.get(id)||null;if(!active)return;const final=active.status==='final',live=active.status==='live';$('result').textContent=final?'FINAL':live?'LIVE GAMECAST':'GAME READY';$('description').textContent=final?`${active.away} ${active.awayScore} · ${active.home} ${active.homeScore}`:live?`${active.away} at ${active.home} are live. Every click advances the whole slate.`:`${active.away} at ${active.home}. Start the day to play every matchup together.`;$('pitch-number').textContent=live?`PITCH ${game?.pitches||0}`:`DAY ${currentDay+1} · ${active.kind}`;$('velocity').textContent='';$('play-log').innerHTML='';restoreViewedGame()}
function startGame(){const day=season.days[currentDay],playable=day.filter(match=>match.status!=='final');if(!playable.length){restoreViewedGame();return}const viewed=active&&day.includes(active)?active:(playable[0]);for(const match of playable){active=match;game=liveGames.get(match.id)||null;if(game)pitchSingleGame();else startSingleGame();liveGames.set(match.id,game);if(match.status==='final')commitFinalGame()}active=viewed;restoreViewedGame()}
function simulateDay(){if(season.days[currentDay].some(match=>match.status==='live')){alert('Finish the live games before simulating the next day.');return}season.days[currentDay].filter(match=>match.status==='scheduled').forEach(match=>{match.awayScore=poisson();match.homeScore=poisson();if(match.awayScore===match.homeScore)match.homeScore++;match.awayHits=Math.max(match.awayScore,poisson(8));match.homeHits=Math.max(match.homeScore,poisson(8));match.status='final';const winner=match.awayScore>match.homeScore?match.away:match.home,loser=winner===match.away?match.home:match.away;season.team[winner].w++;season.team[loser].l++});if(currentDay<season.days.length-1)currentDay++;active=null;game=null;liveGames.clear();$('result').textContent='NEXT DAY READY';$('description').textContent='Choose a game, then play the entire day together.';$('pitch-number').textContent=`DAY ${currentDay+1}`;$('velocity').textContent='';$('pitch-button').disabled=true;$('play-log').innerHTML='';renderSchedule();renderStandings();renderBox();saveProgress()}
function pitchSingleGame(){if(!active||active.status==='final')return;if(!game){startSingleGame();return}const def=defense(),pit=currentPitcher(def),off=offense(),idx=batterIndex(),runner={side:off,index:idx};game.pitches++;pit.pitches++;const o=choose(),mph=Math.floor(78+Math.random()*21);let label=o[2],desc=o[3],r=0;if(o[0]==='ball'){if(++game.balls===4){r=advance(1,true,runner);runs(r);plate({walk:true,rbi:r});pit.bb++;pit.r+=r;pit.er+=r;label='WALK';desc=r?'Ball four — a run scores.':'Ball four. Take your base.';next()}}else if(o[0]==='strike'||o[0]==='foul'){if(o[0]==='strike'||game.strikes<2)game.strikes++;pit.strikes++;if(game.strikes===3){label='STRIKEOUT';desc=`${game.rosters[off].hitters[idx]} goes down swinging.`;plate({strikeout:true});pit.k++;pit.outs++;out()}}else if(['groundout','flyout','popup'].includes(o[0])){plate();pit.outs++;out()}else if(o[0]==='hbp'||o[0]==='error'){r=advance(1,true,runner);runs(r);if(o[0]==='error')plate();if(o[0]==='hbp'){pit.r+=r;pit.er+=r}next()}else{const n=o[0]==='single'?1:o[0]==='double'?2:o[0]==='triple'?3:4;if(n===4){r=game.bases.filter(Boolean).length+1;game.bases.filter(Boolean).forEach(creditRun);game.bases=[false,false,false];game.batting[off][idx].r++}else{r=advance(n,false);game.bases[n-1]=runner}runs(r);plate({hit:true,homeRun:n===4,rbi:r});pit.h++;pit.r+=r;pit.er+=r;if(n===4)pit.hr++;if(r)desc+=` ${r} run${r>1?'s':''} score${r===1?'s':''}!`;next()}if(walkOff()){finish();return}if(active.status==='final')return;if(game.balls===0&&game.strikes===0)managePitcher(defense());$('result').textContent=label;$('description').textContent=desc;$('pitch-number').textContent=`PITCH ${game.pitches}`;$('velocity').textContent=`${mph} MPH`;log(`${label}`);scorebug();renderBox()}
function pitchingTable(team){const side=active?.away===team?'away':'home',roster=game?.rosters?.[side]||makeRoster(team),staff=game?.pitching?.[side]||[blankPitcher(roster.pitcher)],total=staff.reduce((sum,p)=>{Object.keys(sum).forEach(key=>sum[key]+=(p[key]||0));return sum},blankPitcher('TEAM')),row=p=>{const era=p.outs?(p.er*27/p.outs).toFixed(2):'0.00';return `<tr><td class="player">${p.name}</td><td>${ip(p.outs)}</td><td>${p.h}</td><td>${p.r}</td><td>${p.er}</td><td>${p.bb}</td><td>${p.k}</td><td>${p.hr}</td><td>${p.pitches}-${p.strikes}</td><td>${era}</td></tr>`};return `<article class="team-box"><h2><img src="${logo(team)}" alt="">${short(team)} Pitching</h2><table class="stat-table"><thead><tr><th>PITCHERS</th><th>IP</th><th>H</th><th>R</th><th>ER</th><th>BB</th><th>K</th><th>HR</th><th>PC-ST</th><th>ERA</th></tr></thead><tbody>${staff.map(row).join('')}<tr class="total"><td>TEAM</td><td>${ip(total.outs)}</td><td>${total.h}</td><td>${total.r}</td><td>${total.er}</td><td>${total.bb}</td><td>${total.k}</td><td>${total.hr}</td><td>${total.pitches}-${total.strikes}</td><td>${total.outs?(total.er*27/total.outs).toFixed(2):'0.00'}</td></tr></tbody></table></article>`}
function simulateDay(){const day=season.days[currentDay];if(day.some(match=>match.status==='live')){alert('Finish the live games before moving on.');return}day.filter(match=>match.status==='scheduled').forEach(match=>{match.awayScore=poisson();match.homeScore=poisson();if(match.awayScore===match.homeScore)match.homeScore++;match.awayHits=Math.max(match.awayScore,poisson(8));match.homeHits=Math.max(match.homeScore,poisson(8));match.status='final';if(match.postseason)recordPostseasonGame(match);else{const winner=match.awayScore>match.homeScore?match.away:match.home,loser=winner===match.away?match.home:match.away;season.team[winner].w++;season.team[loser].l++}});if(currentDay<season.days.length-1)currentDay++;else if(!season.postseason)startPostseason();else advancePostseason();active=null;game=null;liveGames.clear();$('result').textContent=season.postseason?'POSTSEASON READY':'NEXT DAY READY';$('description').textContent='Choose a game, then play the entire day together.';$('pitch-button').disabled=true;$('play-log').innerHTML='';renderSchedule();renderStandings();renderBox();saveProgress()}
