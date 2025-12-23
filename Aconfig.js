let Aconfig = [
   {
        "name": "yoyDel",
        "workPath": "/tmp", 
        "wsPort": 8090,   
        "userConfig":  {
	        "name": "local",
	        "user": "yoyo@192.168.43.220",
	        "port": 2222,
	        "filesystem":"/dev/sda1",
            "afterLogin": "echo 'Hello on yoyo dell [afterLogin] script :)';"
        }

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
            "afterLogin": "echo 'Hello on huawai a.k.a. HU [afterLogin] script :)';"
        }


    }
];

let Baseconfig = {
    "urlRaport": "http://192.168.43.220:8080/apis/echo"
};

export { Baseconfig, Aconfig }