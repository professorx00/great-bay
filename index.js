const mySQL = require('mysql');
const inquirer = require('inquirer');

const connection = mySQL.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "greatbay_db"
})

connection.connect(function(err) {
    if (err) {
      return console.error('error: ' + err.message);
    }
   
    console.log('Connected to the MySQL server.');
  });

function postAuction(){
    inquirer.prompt([
        {
            name:"item",
            type:"input",
            message:"what is the item you wish to submit?"
        },
        {
            name:"category",
            type:"list",
            choices: ["Sports","Electronics","Antique","Toys","Other"],
            message: "Which category does your item fit?"
        },
        {
            name:"startingBid",
            type:"input",
            message:"what would you like the starting bid to be?",
            validate:function(value){
                if(isNaN(value)==false){
                    return true;
                } else{
                    return false;
                }
            }
        }
    ]).then((answers)=>{
        console.log(answers)
        connection.query("INSERT INTO auctions SET ?", {
            itemname:answers.item,
            category:answers.category,
            startingbid:answers.startingBid,
            highestbid:answers.startingBid
        }, function(err,res){
            if(err){
                console.log(err)
            }
            else{
                console.log("Your Auction was created successfully!");
                start();  
            }
            
            }
        )
    })
}
function bidAuction(){
    connection.query("Select * from auctions", (err,res)=>{
        if(err){console.log(err)}
        var choiceArray = [];
        for(let i=0;i<res.length;i++){
            choiceArray.push(res[i].itemname);
            console.log(`Item: ${res[i].itemname}`);
            console.log(`Item ID: ${res[i].items}`);
            console.log(`Starting Bid: ${res[i].startingbid}`);
            console.log(`Highest Bid: ${res[i].highestbid}`);
            console.log("-------------------------------------");
        }
        inquirer.prompt([
            {
                name:"choice",
                type:"list",
                choices: choiceArray,
                message: "What auction would you like to place a bid on?"
            }
        ]).then((answers)=>{
            res.forEach(element => {
                
                if(answers.choice == element.itemname){
                    let choosenItem = element;
                    inquirer.prompt([
                        {
                            name:"bid",
                            type:"input",
                            message:"how much would you like to bid?",
                            validate:function(value){
                                if(isNaN(value)==false){
                                    return true;
                                } else{
                                    return false;
                                }
                            }
                        }]).then((answer)=>{
                            if(choosenItem.highestbid < parseInt(answer.bid)){
                                connection.query("update auctions set ? where ?",[{
                                    highestbid: answer.bid
                                },{
                                    id:choosenItem.id
                                }], ()=>{
                                    console.log(`Bid Successfully Placed!`);
                                    start();
                                })
                            }
                            else{
                                console.log("Your Bid was too Low! Please try again!")
                                start();
                            }
                        });
                }
            });
        })
    })
}

function start() {
    inquirer.prompt([
        {
            name:"postOrBid",
            type:"list",
            message:"Would you like to [POST] an auction or [BID] on an auction?",
            choices:["POST","BID","Exit"]
        }
    ]).then((answer)=>{
            if(answer.postOrBid.toUpperCase()==="POST"){
                postAuction();
            }
            else if(answer.postOrBid.toUpperCase()==="BID"){
                bidAuction();
            }
            else{
                process.exit();
            }
        });
}

start();