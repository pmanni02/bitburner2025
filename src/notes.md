1. update loopHack script (DONE)
    -  if server is at 85% money capacity, pick a server running grow.js and run hack.js instead
    -  if server is at 20% money capacity, pick a server running hack.js and run grow.js instead

2. create script to find Coding contracts (DONE)

3. update loopHack to automate looking up the best targetServer (DONE)

4. create script to kill all running scripts without resetting funds (DONE)

5. add num threads to loopHack UI -> to get a better sense of optimal proportions (DONE)

6. create loopHackV2 (DONE)
    - redo UI (create drop down menu for server lists)                            (DONE)
    - make server names clickable -> open toast for more options (DONE)
      - add ability to manually change script type for a single server (ie: click on the server and choose either hack/grow/weaken option)
    - add button to change target (DONE)
    - add button to enable/disable basic automation (DONE)
      - enabling the button -> update scripts based on basic security/available funds (instead of manually)
      - disabling the button -> scripts only can be updated manually

7. create clusters
    - add concept of a cluster -> group of servers targeting a single server
      - a new cluster would spawn a new log window OR update the current window
    - add button to create new cluster (group of servers)
    - add ability to move servers between clusters
    - add ability to move servers within cluster

8. create monitorV2
    - merge monitorUI and loopHackUI
    - add buttons/toggles to hide/show server lists
    - add button to display chart showing earnings over time -> to track trends
      - write data to txt OR json file (append)
      - to create chart, read from file and use external chart library

9. update printCodingContracts helper fn
  - add optional filter for coding contracts that have been solved
  - create script to automatically solve specific contracts when found

11. utilize ns.share() API to get bonus multiplier for reputation gain

// COMMANDS
1. Launch monitor for specific server -> eg: `run components/Monitor/main.js foodnstuff`
2. Add custom buttons to Overview UI -> eg: `run index.js`
3. Print coding contracts -> eg: `run helpers.js printCodingContracts`

// MAIN BRANCHES
1. master (main)
2. contracts (coding contract changes)

// INITIAL HACK SETUP
[
  {
    "targetServer": "silver-helix",
    "hackServers": [],
    "growServers": ["n00dles", "foodnstuff", "sigma-cosmetics", "hong-fang-tea"],
    "weakenServers": ["joesguns", "harakiri-sushi"]
  }
]
