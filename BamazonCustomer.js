var mysql = require('mysql');
var inquirer = require('inquirer');
var depsales;

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
	connection.query('SELECT * FROM Products', function(err1, res1){
		inquirer.prompt({
			name:'choice',
			type:'list',
			choices:function(value){
                var choiceArray = ['Exit'];
                for (var i = 0; i < res1.length; i++) {
                    choiceArray.push('Item : '+res1[i].ItemID+', Name: '+res1[i].ProductName+', Price: $'+res1[i].Price.toFixed(2));
                }
                return choiceArray;
			},
			message:'Which item would you like to buy?'
		}).then(function(answer){
				var chosenId=returnItemId(answer.choice)-1;
				howMany(answer,res1[chosenId], updateInventory);
			});	
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
			var totalSale=(userBuy*res.Price).toFixed(2);
			console.log('***********************************************************************');
			console.log('Order fulfilled, cost of your order is $'+ totalSale);
			console.log('***********************************************************************');
			connection.query('SELECT * FROM departments WHERE ?',{DepartmentName:res.DepartmentName}, function(error, results){
				if (error) throw(error);
				depsales=parseFloat(totalSale)+results[0].TotalSales;
				connection.query('UPDATE departments SET ? WHERE ?',[{TotalSales:depsales},
					{DepartmentName:res.DepartmentName}], function(err2,res2){
						if (err2) throw(err2);
						console.log('update success \n\n');
				});
			});
			start();
	}

}
function depscall(){
	console.log('got to the depscall');
			connection.query('SELECT * FROM departments', function(error, result){
				console.log('inthe query');
       			if (error) throw(error);
       			console.log(result);
       		});
       		end();
}
function end(){
	connection.end();
	process.exit();
}
