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
			choices:['Exit','View Products for Sale','View Low Inventory','Add to Inventory','Add New Product'],
			message:'Which option would you like?'
		}).then(function(answer){
				switch(answer.choice){
					case 'Exit':{
						end();
					}
					case 'View Products for Sale':{
						console.log('Total Inventory:');
						connection.query('SELECT * FROM Products', function(err, res){
							if (err) {throw(err);}
							var inventory=[];
							// console.log('ID','Product Name','Price','Quantity');
							for (var i=0;i<res.length;i++){
								inventory.push([res[i].ItemID, res[i].ProductName,res[i].Price.toFixed(2),res[i].StockQuantity]);
							}
								console.table(['ID','Product Name','Price($)','Quantity'],inventory);
								start();
						});
						break;
					}
					case 'View Low Inventory':{
						console.log('Inventory less than 5 units');
						connection.query('SELECT * FROM Products', function(err, res){
							if (err) {throw(err);}
							var inventory=[];
							for (var i=0;i<res.length;i++){
								if (res[i].StockQuantity<5){
									inventory.push([res[i].ItemID, res[i].ProductName,res[i].Price.toFixed(2),res[i].StockQuantity]);
								}
							}
								console.table(['ID','Product Name','Price($)','Quantity'],inventory);
								start();
						});
						break;
					}
					case 'Add to Inventory':{
						connection.query('SELECT * FROM Products', function(err, res){
							if (err) {throw(err);}
							inquirer.prompt({
								name:'addInventory',
								type:'list',
								choices:function(value){
										var choiceArray=['Exit'];
										for (var i=0;i<res.length;i++){
	                    					choiceArray.push('Item : '+res[i].ItemID+', Name: '+
	                    						res[i].ProductName+', Price: $'+res[i].Price.toFixed(2)+', Quantity = '+res[i].StockQuantity);
                    					}
                    					return choiceArray;
									},
								message:'Which item would you like to add inventory?'
							}).then(function(add){
								if (add.addInventory==='Exit'){
									start();
								} else {
									inquirer.prompt({
										name:'quantity',
										type:'input',
										message:'How many items?'
									}).then(function(number){
										var updateID=returnItemId(add.addInventory);
										var ordered=parseInt(number.quantity);
										var updateQuant=ordered+res[updateID-1].StockQuantity;
										connection.query("UPDATE Products SET ? WHERE ?", [{
										    StockQuantity: updateQuant
										}, {
										    ItemID: updateID
										}], function(err, res) {});
										var totalCost=ordered*res[updateID-1].Price*.85;
										connection.query('SELECT * FROM departments WHERE ?',{DepartmentName:res[updateID-1].DepartmentName},
										 	function(error, results){
												if (error) throw(error);
												var totalOverHead=totalCost+results[0].OverHeadCosts;
												connection.query('UPDATE departments SET ? WHERE ?',[{OverHeadCosts:totalOverHead},
													{DepartmentName:res[updateID-1].DepartmentName}], function(err2,res2){
														if (err2) throw(err2);
											});
										});
										console.log('Additional inventory ordered, cost= $'+(totalCost).toFixed(2));
										start();
									});
								}
							});
						});
						break;
					}
					case 'Add New Product':{
						inquirer.prompt([
							{
								type:"input",
								message:"Product Name:",
								name:"pname"
							},
							{
								type:"input",
								message:"Department Name:",
								name:"dname"
							},
							{
								type:"input",
								message:"Price:",
								name:"price"
							},
							{
								type:"input",
								message:"Quantity:",
								name: "quant"
							}
						]).then(function(out){
							connection.query('INSERT INTO Products SET ?',{
								ProductName:out.pname,
								DepartmentName:out.dname,
								Price:out.price,
								StockQuantity:out.quant
								}, function(err, res3){});
							console.log('Successful update, cost= $'+(out.quant*out.price).toFixed(2));
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
