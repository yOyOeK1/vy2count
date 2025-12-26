


portNo=8081
echo "Start at port [ $portNo ]"
websocat -s "$portNo" sh-c:"exec bash -c ./terminal.sh"