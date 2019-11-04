
mkdir -p $(dirname $0)/../html_bkp
scp -rpi $(dirname $0)/PK_project_machine.pem  ubuntu@ec2-52-91-8-83.compute-1.amazonaws.com:/var/www/html/*  $(dirname $0)/../html_bkp/.
