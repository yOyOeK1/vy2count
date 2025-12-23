
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


    let onSPMsg = ( msg ) => {
        //l(['onSubProcessMesg ', msg]);
        
        wsClient.send( `# CMD_RES [${mStr}]\n#RES_START#\n[[${msg}]]\n#RES_END#` );
    };
    let onSPClose = ( msg ) => {
        //l(['onSubProcessMesg ', msg]);
        
        wsClient.send( `# CMD_RES [${mStr}]\n#EXIT_CODE#${msg}` );
    };



    if( mStr == '@R' ){
        let raport = {
            agent: agent.name,
            cmdSCount, entryDate: Date.now(),
            status: "ok"
        };
        
        raportToBase( raport );
        //wsClient.send( JSON.stringify(raport,null,4) );
        onSPMsg( JSON.stringify(raport,null,4) );

    }else if( mStr.startsWith('+W:') ) {
        let wDirPath = path.join( agent.workPath, 'vy2' );
        let wDir = undefined;
        
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
        try{
            rDir = fs.readdirSync( wDir );
            wDirOk = true;
        }catch(e){
            l(`#error no target directory [${wDir}]`);
            onSPMsg('working directory not existing. Try +W:nameOfProject');
            onSPClose(-1);
            return 1;
        }
        
        let tr = [];
        rDir.forEach(d=>{
            let dInfo = {
                dirName: d,
                dirname: wDir,
                list: fs.readdirSync( path.join( wDir, d ) )
            };

            tr.push( JSON.stringify(dInfo) );
        });

        onSPMsg(tr.join('\n'));
        onSPClose(0);

    }else if( ['h', '?'].indexOf( mStr ) != -1  ){
        wsClient.send( `--- help --
            ? | h   - help 
            @R      - raport to base
            @W      - print working directory status
            +W:name - create working directory with "name"
            E:exec    - if string is send it will be executed  
            \n--- help ----`

        );


    }else if( mStr.startsWith('E:') ) {
        let sph = new vy2subProcess( 'pwdTest1', onSPMsg, onSPClose );
        sph.run( mStr.substring(2) );
        
    
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
    

    
    
});







let raportToBaseYYYNAN = ( OptsJson ) => {
    let sp = new vy2subProcess( 'raportToBase' );
    let oArray = [];
    Object.keys( OptsJson ).forEach( k => oArray.push( `${k}=${OptsJson[k]}` ) );
    let curlVite = 'curl '+Baseconfig.urlRaport+' -X POST -d "'+oArray.join('&')+'";'
    sp.run( 'ssh -T a@hu -p 2222 -o ExitOnForwardFailure=yes \''+curlVite+'\'' );
};


let raportToBase = ( OptsJson ) => {
    let sp = new vy2subProcess( 'raportToBase' );
    let oArray = [];
    Object.keys( OptsJson ).forEach( k => oArray.push( `${k}=${OptsJson[k]}` ) );
    let curlVite = 'curl '+Baseconfig.urlRaport+' -s -X POST -d "'+oArray.join('&')+'";'
    sp.run( curlVite );
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
