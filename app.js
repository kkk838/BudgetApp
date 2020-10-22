
var budgetController=( function()
{
	var Expense = function(id,description,value)
	{
		this.id = id;
		this.description = description;
		this.value = value;
	};

	Expense.prototype.calcPrecentage = function(totalIncome)
	{
		if(totalIncome>0)
		{
			this.percentage = Math.round((this.value / totalIncome)*100);
		}
		else
		{
			this.percentage = -1;
		}
	};


	Expense.prototype.getPercentage = function()
	{
		return this.percentage;
	}
	var Income = function(id,description,value)
	{
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var data={
		allItems:{
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};

	var calculateTotal = function(type)
	{
		var sum=0;
		data.allItems[type].forEach(function(curr)
		{
			sum+=curr.value;
		});
		data.totals[type] = sum;
	}

	return {
		addItem: function(type,des,val)
		{
			var newItem,ID;
			//Create new ID
			if(data.allItems[type].length >0)
			{
				ID = data.allItems[type][data.allItems[type].length-1].id + 1;
			}
			else
			{
				ID = 0;
			}
			if(type === 'exp')
			{
				newItem = new Expense(ID,des,val);
			}
			else if(type === 'inc')
			{
				newItem = new Income(ID,des,val);
			}

			data.allItems[type].push(newItem);
			return newItem;
		},

		deleteItem: function(type, id)
		{
			var ids,index;
			//data.allItems[type][id];

			ids = data.allItems[type].map(function(current) //this return array as ids
			{
				return current.id;
			});

			index = ids.indexOf(id);

			if(index !== -1)
			{
				data.allItems[type].splice(index,1); //delete n number of element fron given index
			}
		},

		calculateBudget: function()
		{
			//calculate total income and expences
			calculateTotal('inc');
			calculateTotal('exp');

			// calculate the budget: income-expences
			data.budget = data.totals.inc - data.totals.exp;

			//calculate the percentage of income that we spent
			if(data.totals.inc > 0)
			{
				data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
			}
			else
			{
				data.percentage = -1;
			}
			
		},

		calculatePercentages: function()
		{
			data.allItems.exp.forEach(function(cur)
			{
				cur.calcPrecentage(data.totals.inc);
			});
		},

		getPercentages: function()
		{
			var allPerc = data.allItems.exp.map(function(cur)
			{
				return cur.getPercentage();
			});
			return allPerc;
		},

		getBudget: function()
		{
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};
		},

		testing: function()
		{
			return data;
		}
	};

})();

var UIController =(function()
{
  //some code

  	var DOMstrings = {
  		inputType: '.add__type',
  		inputDiscription: '.add__description',
  		inputValue: '.add__value',
  		inputBtn: '.add__btn',
  		incomeContainer: '.income__list',
  		expencesContainer: '.expenses__list',
  		budgetLable: '.budget__value',
  		incomeLable: '.budget__income--value',
  		expencesLabel: '.budget__expenses--value',
  		percentageLabel: '.budget__expenses--percentage',
  		container: '.container',
  		expencesPercLabel: '.item__percentage',
  		dateLabel: '.budget__title--month'
  	};

  	formatNumber = function(num, type)
  		{
  			var numSplit,int,dec;


  			num = Math.abs(num);
  			num = num.toFixed(2);

  			numSplit = num.split('.');
  			int  = numSplit[0];
  			if(int.length > 3)
  			{
  				var rem = int.length%3;
  				var numOfComma = Math.floor(int.length / 3);
  				var startComma,temp;
  				if(rem===0)
  				{
  					temp = int.substr(0,3);
  					startComma = 1;
  				}
  				else
  				{
  					temp = int.substr(0,rem);
  					startComma = 0;
  				}
  				for(var i=startComma;i<numOfComma;i++)
  				{
  					temp = temp +','+int.substr((rem+(i*3)), 3);
  				}
  				int = temp;
  			}
  			dec = numSplit[1];
  			return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  		};

  		nodeListForEach = function(list,callback)
  			{
  				for(var i = 0;i<list.length;i++)
  				{
  					callback(list[i],i);
  				}	
  			};

  	return {
  		getinput: function()
  		{
  			return {
  				type: document.querySelector(DOMstrings.inputType).value,
  				description: document.querySelector(DOMstrings.inputDiscription).value,
  				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
  			};
  		},

  		addListItem: function(obj,type)
  		{
  			var html,newHtml,element;
  			//Create HTML string with Place holder text

  			if(type === 'inc')
  			{
  				element = DOMstrings.incomeContainer;
  				html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"> </i> </button> </div> </div> </div>';
  			}
  			else if(type === 'exp')
  			{
  				element = DOMstrings.expencesContainer;
  				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"> <i class="ion-ios-close-outline"> </i> </button> </div> </div> </div>';
  			}

  			// Replace the placeholder value with some actual data

  			newHtml = html.replace('%id%',obj.id);
  			newHtml = newHtml.replace('%description%',obj.description);
  			newHtml = newHtml.replace('%value%',formatNumber(obj.value, type));

  			//Insert the HTML into the DOM
  			document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);							  //insert Adjacent html method

  		},

  		deleteListItem: function(selectorID)  //In javascript can't remove html element but can remove child element of html element
  		{
  			var el = document.getElementById(selectorID);
  			el.parentNode.removeChild(el);
  		},

  		clearFields: function()
  		{
  			var field,fieldsArr;
  			field = document.querySelectorAll(DOMstrings.inputDiscription +', '+DOMstrings.inputValue);
  			fieldsArr = Array.prototype.slice.call(field);
  			fieldsArr.forEach(function(current,index,array)
  				{
  					current.value = "";
  				});
  			
  			fieldsArr[0].focus();
  		},

  		displayBudget: function(obj)
  		{
  			var type = obj.budget < 0 ? 'exp' : 'inc';

  			document.querySelector(DOMstrings.budgetLable).textContent = formatNumber(obj.budget, type);
  			document.querySelector(DOMstrings.incomeLable).textContent = formatNumber(obj.totalInc, 'inc');
  			document.querySelector(DOMstrings.expencesLabel).textContent = formatNumber(obj.totalExp, 'exp');
  			
  			if(obj.percentage>=0)
  			{
  				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage+'%';
  			}
  			else
  			{
  				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
  			}
  		},

  		displayPercentages: function(percentages)
  		{
  			var fields = document.querySelectorAll(DOMstrings.expencesPercLabel);


  			nodeListForEach(fields,function(current,index)
  			{
  				if(percentages[index] > 0)
  				{
  					current.textContent = percentages[index] + '%';
  				}
  				else
  				{
  					current.textContent = '---';
  				}
  				
  			});
  		},

  		displayMonth: function()
  		{
  			var now,month,year,months;
  			months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  			now = new Date();
  			month = now.getMonth();
  			year = now.getFullYear();
  			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
  		},

  		changeType: function()
  		{
  			var fields = document.querySelectorAll(
  				DOMstrings.inputType + ','+
  				DOMstrings.inputDiscription +','+
  				DOMstrings.inputValue
  				);

  			nodeListForEach(fields, function(cur)
  			{
  				cur.classList.toggle('red-focus'); 
  			});

  			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

  		},

  		getDOMstring: function()
  		{
  			return DOMstrings;
  		}
  	};

  	
  		
  	


})();

var controller = (function(budgetCtrl,UICtrl)
{
	var setupEventListener = function()
	{
		var DOM = UICtrl.getDOMstring();
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

		document.addEventListener('keypress', function(event)
		{
			if(event.keycode === 13 || event.which === 13)
			{
				ctrlAddItem();
			}
		});
		document.querySelector(DOM.container).addEventListener('click', ctrlDeletItem);
		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
	}

	var updateBudget = function()
	{
		// 1. Calculate the budget
		budgetCtrl.calculateBudget();

		// 2. Return Budget
		var budget = budgetCtrl.getBudget();

		// 3. Display the budget on the UI
		UICtrl.displayBudget(budget);
		console.log(budget);
	}

	var updatePercentages = function()
	{
		// 1. Calculate percentages
		budgetCtrl.calculatePercentages();

		// 2. read percentages from the budget controller
		var percentages = budgetCtrl.getPercentages();

		// 3. Update the UI with the new percentages
		UICtrl.displayPercentages(percentages);

	}
	

	function ctrlAddItem()
	{
		// !.Get the field input data
		var input = UICtrl.getinput();

		if(input.description !== "" && !isNaN(input.value) && input.value > 0)
		{
			// 2. Add the item to the budget controller
			var newItem = budgetCtrl.addItem(input.type, input.description, input.value);
			console.log(newItem);

			// 3. Add the item to the UI
			UICtrl.addListItem(newItem,input.type);

			// 4. Clear the Items from input fields
			UICtrl.clearFields();

			// 5. Calculate and Update Budget

			updateBudget();

			// 6. Update the Percentages

			updatePercentages();

		}
	}

	var ctrlDeletItem = function(event)
	{
		var itemID, type, ID;

		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		if(itemID)
		{
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);

			// 1. delete the item from data structure
			budgetCtrl.deleteItem(type, ID);

			// 2. Delete the item from the UI
			UICtrl.deleteListItem(itemID);

			// 3. Update and show the new budget
			updateBudget();

			// 4. Calculate and Update the percentages
		}
	}

	return{
		init: function()
		{
			console.log('Application has staeted');
			UICtrl.displayMonth();
			var budget = {
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			}
			UICtrl.displayBudget(budget);
			setupEventListener();


		}
	};


})(budgetController,UIController);

controller.init();