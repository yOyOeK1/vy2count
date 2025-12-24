
import { Aconfig, Baseconfig } from './Aconfig.js'
import { vy2subProcess } from './subProcess.js';
import { getWs } from './ws.js';
import fs from 'fs';
import path, { basename } from 'path';

let cmdSCount = 0;
let cmds = [];
let agent = undefined;

function l(msg){
    console.log( msg );
}

function isPidRunning(pid) {
    try {
        process.kill(pid, 0);
        return true;
    } catch (error) {
        if (error.code === 'ESRCH') {
            return false;
        }
        if (error.code === 'EPERM') {
            return true;
        }
        console.error(`# Error checking PID ${pid}: ${error.message}`);
        return false;
    }
}




//l(['args ',process.argv.length]);
if( process.argv.length <= 2 ){
    l(['have args: ',JSON.stringify( process.argv )]);
    l( 'you need to start it: node ./agent.js userConfig' );
    process.exit(-1);
}else{
    let cIn = Aconfig.findIndex( c => c.name == process.argv[2] );
    if( cIn != -1 ) agent = Aconfig[ cIn ];
    else{
        l('Can\'t find userConfig: ['+process.argv[2]+']');
        Aconfig.forEach( c=> l( ` * agent [${c.name}] ` ) ) 
        process.exit(-2);
    }
}


l(['Will use agent config',agent]);


let wss = getWs( '0.0.0.0', agent.wsPort, (wsClient, onMsg) =>{
    let mStr = onMsg.toString();
    cmdSCount++;

    //l(['wsMessage('+cmdSCount+'):', mStr]);
    /*
E:echo "tastk1.1"; sleep 5; echo "task1.2"; sleep 3; echo "task1.3"; sleep 3; echo "task1.4";
E:echo "tastk2.1"; sleep 3; echo "task2.2"; sleep 2; echo "task2.3"; sleep 2; echo "task2.4"; 
    */

    let onSPMsg = ( msg, cmdNo = -1 ) => {
        //l(['onSubProcessMesg ', msg]);
        //wsClient.send( `#${cmdSCount} CMD_RES [${mStr}]\n#RES_START#\n[[${msg}]]\n#RES_END#` );
        
        //wsClient.send( `#R${cmdNo}\n#RES_START#\n[[${msg}]]\n#RES_END#` );
        //(liteType = 'D', cNo = -1,  obj = undefined ) => {
        wsClient.sendLine( 'R', cmdNo, {'cn':cmdNo, msg} );
    };

    let onSPClose = ( msg, cmdNo = -1 ) => {
        //l(['onSubProcessMesg ', msg]);
        //wsClient.send( `#C${cmdNo}\n#EXIT_CODE#${msg}` );
        wsClient.sendLine( 'C', cmdNo, {'cn':cmdNo, 'exitCode':msg, entryDate:Date.now() } );
        //console.log('comds in stock ',cmds.length);
        
    };



    if( mStr == '@R' ){
        
        let raport = {
            agent: agent.name,
            cmdSCount, 
            'cmds':btoa(JSON.stringify(cmds)),
            status: "ok",
            entryDate: Date.now(),
        };
        
        raportToBase( raport );
        //wsClient.send( JSON.stringify(raport,null,4) );
        onSPMsg( JSON.stringify(raport,null,4) );
        console.log( JSON.stringify(raport,null,4) );
        let cNr = 0;
        cmds.forEach( c =>{
            console.log( `#R_cmd${cNr++} running [${isPidRunning(c.pid)}]`, c );
            
        });

    }else if( mStr.startsWith('+W:') ) {
        let wDirPath = path.join( agent.workPath, 'vy2' );
        let wDir = undefined;
        
        wsClient.send( `#E${cmdSCount} cmd [${mStr}] running [true]` );

        let nDirName = mStr.substring(3);
        if( nDirName == '' ){
            onSPMsg('wrong directory name ['+nDirName+']');
            onSPClose(-1);
            return -1;
        } 
        let nDirPath = path.join( wDirPath, nDirName );

        try{
            wDir = fs.readdirSync( wDirPath );            
        }catch(e){
            l('making wDirPach: '+wDirPath);
            fs.mkdirSync( wDirPath );
        }

        try{
            wDir = fs.readdirSync( nDirPath );   
            onSPMsg('directory exists ['+nDirName+']');
            onSPClose(-2);
            return -2;
        }catch(e){
            fs.mkdirSync( nDirPath );
        }


        onSPMsg('directory is added ['+nDirPath+']');
        onSPClose(0);


    }else if( mStr == '@W' ) {
        let wDir = path.join( agent.workPath, 'vy2' );
        let wDirOk = false;
        let rDir = undefined

        wsClient.send( `#E${cmdSCount} cmd [${mStr}] running [true]` );

        try{
            rDir = fs.readdirSync( wDir );
            wDirOk = true;
        }catch(e){
            l(`#error no target directory [${wDir}]`);
            onSPMsg('working directory not existing. Try +W:nameOfProject looking now at ['+wDir+']', cmdSCount);
            onSPClose(-1, cmdSCount);
            return 1;
        }
        
        let tr = [];
        rDir.forEach(d=>{
            let dInfo = {
                dirName: d,
                dirname: wDir,
                fsList: fs.readdirSync( path.join( wDir, d ) )
            };

            tr.push( JSON.stringify(dInfo) );
        });

        onSPMsg(tr.join('\n'), cmdSCount);
        onSPClose(0, cmdSCount);

    }else if( ['h', '?'].indexOf( mStr ) != -1  ){
        wsClient.send( `--- help --
            ? | h   - help 
            @R      - raport to base
            @W      - print working directory status
            +W:nameW - create working directory with "name"
            +B:nameW:nameF:base64 
                    - to send binary as base64 with target working directory and name for file
            E:exec    - if string is send it will be executed  
            \n--- help ----`

        );

    }else if( mStr.startsWith('+B:') ) {
        let line = mStr.split(':');
        let workDir = line[1];
        let fileName = line[2];
        let b64 = line[3];
        wsClient.sendLine( 'E', cmdSCount, {'cn':cmdSCount, workDir, fileName, b64len:b64.length } );
        console.log({ workDir, fileName, b64length:b64.length });

        let dirPath = path.join( agent.workPath, 'vy2', workDir );
        let dirOk = false;
        try{
            fs.readdirSync( dirPath );
            dirOk = true;
        }catch(e){}

        let binData = Buffer.from(b64, 'base64');
        let file = fs.writeFileSync( 
            path.join( dirPath, fileName ), 
            binData,
            ee =>{
                console.log('EE can\'t convert base64 correctly :(',ee);
            }
        );
        onSPClose(0, cmdSCount);


    }else if( mStr.startsWith('E:') ) {
        let sph = new vy2subProcess( 'pwdTest1', onSPMsg, onSPClose );
        sph.run( mStr.substring(2), cmdSCount );
        //console.log('subProcess pid:', sph.sp.pid );
        cmds.push( { cmdSCount, 'cmd':mStr.substring(2), pid: sph.sp.pid, /*'sp':sph,*/ placeStart: 4} );
        
        //wsClient.send( `#E${cmdSCount} cmd [${mStr.substring(2)}] pid [${sph.sp.pid}] running [${!sph.sp.killed}]` );
        wsClient.sendLine( 'E', cmdSCount, {'cn':cmdSCount, cmd:mStr.substring(2), pid: sph.sp.pid, isRunning: !sph.sp.killed, entryDate:Date.now() } );
    /*
    }else if( mStr == 'ls' ){
        //l(['got ls']);
        let sph = new vy2subProcess( 'pwdTest1', onSPMsg );
        //sph.run( 'ssh -T a@hu -p 2222 -o ExitOnForwardFailure=yes "ls"' );
        sph.run( 'ssh -T a@hu -p 2222 -o ExitOnForwardFailure=yes "ls"' );
    
    }else if( mStr == 'pwd' ){
        //l(['got ls']);
        let sph = new vy2subProcess( 'pwdTest1', onSPMsg );
        sph.run( 'ssh -T a@hu -p 2222 -o ExitOnForwardFailure=yes "pwd"' );
    */   
    
    }else{
        l('EE msg');
        onSPMsg('NaN');
    }
    

    
    
}
);







let raportToBaseYYYNAN = ( OptsJson ) => {
    let sp = new vy2subProcess( 'raportToBase' );
    let oArray = [];
    Object.keys( OptsJson ).forEach( k => oArray.push( `${k}=${OptsJson[k]}` ) );
    let curlVite = 'curl '+agent.userConfig.MasterURL+' -X POST -d "'+oArray.join('&')+'";'
    let cmdRun = 'ssh -T a@hu -p 2222 -o ExitOnForwardFailure=yes \''+curlVite+'\'';
    sp.run( cmdRun, cmdSCount );
    cmds.push( { cmdSCount, 'cmd': cmdRun, pid: sp.sp.pid, /*sp,*/ placeStart: 2} );
    //cmds.push( { cmdSCount, 'cmd':mStr.substring(2), pid: sph.sp.pid, 'sp':sph, placeStart: 4} );
};


let raportToBase = ( OptsJson ) => {
    let sp = new vy2subProcess( 'raportToBase' );
    let oArray = [];
    Object.keys( OptsJson ).forEach( k => oArray.push( `${k}=${OptsJson[k]}` ) );
    let curlVite = 'curl '+agent.userConfig.MasterURL+' -s -X POST -d "'+oArray.join('&')+'";'
    sp.run( curlVite, cmdSCount );
    cmds.push( { cmdSCount, 'cmd': curlVite,pid: sp.sp.pid, /*sp,*/ placeStart: 1} );
    //cmds.push( { cmdSCount, 'cmd':mStr.substring(2), pid: sph.sp.pid, 'sp':sph, placeStart: 4} );

};






if(0){





let sph = new vy2subProcess( 'pwdTest1' );
//sph.run( 'ssh -T a@hu -p 2222 -o ExitOnForwardFailure=yes "whoami"' );
let sp2 = new vy2subProcess( 'pwdT2' );
//sp2.run( 'ssh -T a@hu -p 2222 -o ExitOnForwardFailure=yes "exit 1"' );

let sp3 = new vy2subProcess( 'FreeTest' );
//sp3.run( 'ssh -T a@hu -p 2222 -o ExitOnForwardFailure=yes "free"' );

let cvOpts = {
    'whoami': '`whoami`',
    'uptime': '`uptime`',
    'entryDate': '`date +%s%3N`',
};
let cvOptsArray = [];
Object.keys( cvOpts ).forEach( k => cvOptsArray.push( `${k}=${cvOpts[k]}` ) );



let curlVite = 'curl http://192.168.43.220:8080/apis/echo -s -X POST -d "'+cvOptsArray.join('&')+'";'
sph.run( 'ssh -T a@hu -p 2222 -o ExitOnForwardFailure=yes \'echo "Curl TEST abc_["`whoami`"]"; sleep 1; '+curlVite+' \'' );
//sp.run( 'pwd;sleep .5;cal;sleep .5; echo "ok exit 2"; exit 2;' );





raportToBase({a:1,t:11, status: "ok"});

}
