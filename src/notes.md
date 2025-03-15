1. update loopHack script (DONE)
    -  if server is at 85% money capacity, pick a server running grow.js and run hack.js instead
    -  if server is at 20% money capacity, pick a server running hack.js and run grow.js instead

2. create script to find Coding contracts (DONE)

3. update loopHack to automate looking up the best targetServer

4. create script to kill all running scripts without resetting funds (DONE)

5. add num threads to loopHack UI -> to get a better sense of optimal proportions (DONE)

6. create loopHackV2
    - redo UI (create drop down menu for server lists)
    - add concept of a cluster -> group of servers targeting a single server
      - a new cluster would spawn a new log window OR update the current window
    - add button to create new cluster (group of servers)
    - make server names clickable -> open toast for more options
      - add ability to move servers between clusters
      - add ability to move servers within cluster
    - add button to change target

7. create monitorV2
    - add button to display chart showing earnings over time -> to track trends
      - write data to txt OR json file (append)
      - to create chart, read from file and use external chart library