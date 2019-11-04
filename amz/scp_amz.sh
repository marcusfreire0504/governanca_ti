scp -rpi $(dirname $0)/PK_project_machine.pem  $(dirname $0)/../html/* ubuntu@ec2-52-91-8-83.compute-1.amazonaws.com:/var/www/html/.
