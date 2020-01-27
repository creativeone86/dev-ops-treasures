The Vagrand had issues with initial boot because of missing log file which it expected.
When i was able to login i scp-ed with Vagrant plugin the backup files to my host.
From there it was logical for me to use Docker as i know it more.
The next step for me was to build the containers and their communication with the node app (container).
Then i found that mariadb backup was expecting different version from what i have, but when this
was clear everything came to its place.
It was great fun!
