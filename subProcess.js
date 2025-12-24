
import { spawn } from 'node:child_process';


class vy2subProcess{


    constructor( ident, onMsg = undefined, onClose = undefined ){
        this.opts = { ident, onMsg, onClose };
        this.l(`v2ysubProc ident .... `); 

        this.sp = undefined;
        this.cmdNo = -1;
        this.spRunning = false;

        this.profile = { start:0, end:0 };
    }

    l =(msg)=>{
        console.log(this.opts.ident+': ', msg );
    }

    dumpMsg = ( title, data, cmdNo='' ) => {
        this.l('dumpMsg ['+cmdNo+'] '+title);
        this.l(data);

        if( title == 'close (exitCode)' ){
            this.l(['profile: ', (this.profile.end - this.profile.start)+' ms.' ]);
        }

    }

    emit = ( line ) => {
        if( !this.spRunning ){
            this.l('spawn not running');
            return -1;
        } 
    }

    run = ( cmd, cmdNo ) => {
        this.profile.start = Date.now();
        this.cmdNo = cmdNo;
        let stdio = (o)=>{
            this.l(['Fake stdio ',o]);
        };

        //this.l(['will do cmd',cmd]);


        let sp = spawn( cmd, { 
            shell: true 
        });
        this.spRunning = true;

        sp.stdout.on( 'data', d =>{
            if( this.opts.onMsg ) this.opts.onMsg( d.toString(), cmdNo );
            else this.dumpMsg( 'stdout.data', d.toString(), cmdNo );
        });

        sp.stderr.on( 'data', d =>{
            if( this.opts.onMsg ) this.opts.onMsg( d.toString(), cmdNo );
            else this.dumpMsg( 'stderr.data', d.toString(), cmdNo );
        });

        sp.on('close', exitCode => {
            this.spRunning = false;
            this.profile.end = Date.now();


            if( this.opts.onClose ) this.opts.onClose( exitCode, cmdNo );
            else this.dumpMsg( 'close (exitCode)', exitCode, cmdNo );
        });

        sp.stdin.end();

        this.sp = sp;

    }


}

export {
    vy2subProcess

}