let Aconfig = [
    {
        "name": "local",
        "workPath": "/tmp", 
        "wsPort": 8190,   
        "userConfig":  {
	        "name": "",
	        "user": "",
	        "port": "",
	        "filesystem":"/dev/sda1",
            "afterLogin": "echo 'Hello on local config [afterLogin] script :)';",
            
            "tunnel": "",  
            "MasterURL": "http://localhost:8080/apis/echo",
        },
    },

   {
        "name": "yoyDel",
        "workPath": "/tmp", 
        "wsPort": 8090,   
        "userConfig":  {
	        "name": "local",
	        "user": "yoyo@192.168.43.220",
	        "port": 2222,
	        "filesystem":"/dev/sda1",
            "afterLogin": "echo 'Hello on yoyo dell [afterLogin] script :)';",
            
            "tunnel": "",  
            "MasterURL": "http://192.168.43.220:8080/apis/echo",
        },
    },
    {
        "name": "hu",
        "workPath": "/data/data/com.termux/files/usr/tmp",    
        "wsPort": 8091,
        "userConfig":  {
	        "name": "hu",
	        "user": "a@hu",
	        "port": 2222,
	        "filesystem":"/dev/block/by-name/userdata",
            "afterLogin": "echo 'Hello on huawai a.k.a. HU [afterLogin] script :)';",

            "tunnel": "18080:localhost:8080",  
            "MasterURL": "http://localhost:18080/apis/echo",
        }


    }
];

let Baseconfig = {
    "urlRaport": "http://192.168.43.220:8080/apis/echo"
};

export { Baseconfig, Aconfig }