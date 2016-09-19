var mysql = require('mysql');
var inquirer = require('inquirer');
var table = require('console.table');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root", //Your username
    password: "!!CRUMBLE!@8i6", //Your password
    database: "Bamazon_DB"
});

function start(){
	//Display items in the database
	// console.log('Here\'s the items for sale:');
		inquirer.prompt({
			name:'choice',
			type:'list',
			choices:['Exit','View Product Sales by Department','Create New Department'],
			message:'Which option would you like?'
		}).then(function(answer){
				switch(answer.choice){
					case 'Exit':{
						end();
					}
					case 'View Product Sales by Department':{
						connection.query('SELECT * FROM Departments', function(err, res){
							if (err) {throw(err);}
							var depstats=[];
							for (var i=0;i<res.length;i++){
								// var profit=parseFloat(res[i].totalSales)-parseFloat(res[i].OverHeadCosts)
								depstats.push([res[i].DepartmentID, res[i].DepartmentName,res[i].OverHeadCosts.toFixed(2),res[i].TotalSales.toFixed(2),
									(res[i].TotalSales-res[i].OverHeadCosts).toFixed(2)]);
							}
								console.table(['DepartmentID','Department Name','Over Head Costs($)','Product Sales($)','Total Profit($)'],depstats);
								start();
						});
						break;
					}
					case 'Create New Department':{
						inquirer.prompt([
							{
								type:"input",
								message:"Department Name:",
								name:"dname"
							},
							{
								type:"input",
								message:"Initial Over Head Costs:",
								name:"ohcost"
							},
							{
								type:"input",
								message:"Initial Product Sales:",
								name:"ipsales"
							}
						]).then(function(out){
							connection.query('INSERT INTO Departments SET ?',{
								DepartmentName:out.dname,
								OverHeadCosts:out.ohcost,
								TotalSales:out.ipsales
								}, function(err, res3){
								// console.log(res3);								
								});
								// console.log('Department Created, initial profit: $'(parseFloat(out.ipsales)-parseFloat(out.ohcost)).toFixed(2));	
							console.log('Department Created.');
							start();
						});
						break;
					}
				}
			});	
		}
start();
function returnItemId(string){
	var id='';
	for (var i=7;i<string.length;i++){
		if (string.charAt(i)!=','){
			id+=string.charAt(i);
		}else {
			return parseInt(id);
		}
	}
}
function howMany(answer, result, callback){
	if (answer.choice==='Exit'){end();};
	inquirer.prompt({
		name:'quantity',
		type:'input',
		message: 'How many would you like to buy (0 to return to the products menu)?'
	}).then(function(number){
		callback(answer,number.quantity,result);
	});
}
function updateInventory(answer,userBuy,res){
	if (userBuy==0){
		start();
	}else if(res.StockQuantity<userBuy){
		console.log('Sorry, but we only have '+res.StockQuantity+' in stock');
		howMany(answer,res,updateInventory);
	}else if (userBuy <0){
		console.log('Dude get real!');
		howMany(answer,res,updateInventory);
	}else {
			connection.query('UPDATE Products SET ? WHERE ?',[{StockQuantity:(res.StockQuantity-userBuy)},
			{ProductName:res.ProductName}], function(err, res){
				if (err) throw(err);
			});
			console.log('***********************************************************************');
			console.log('Order fulfilled, cost of your order is $'+ (userBuy*res.Price).toFixed(2));
			console.log('***********************************************************************');
			start();
	}

}
function end(){
	connection.end();
	process.exit();
}
