$(function() {
	$('#page0, #page1, #page2, a.carousel-cntrl').click(function() {
		if(!$(this).parent().hasClass('disabled')) {
			var id = this.id;
			if(!isNaN(parseInt(id.substr(-1))))
				$('#carousel').carousel(parseInt(id.substr(-1)));
			else
				$('#carousel').carousel(id);
		}
	});
	$('#carousel').on('slid.bs.carousel',function() {
		var page = $(this).find('.item.active').attr('id').substr(-1);
		$('.pagination li').removeClass('active').not('.perm').removeClass('disabled');
		$('#page'+page).parent().addClass('active');
		if(page==0) {
			$('.pagination li').first().addClass('disabled');
		} else if(page==1) {
			if($('#page2').parent().hasClass('disabled'))
				$('.pagination li').last().addClass('disabled');
		} else if(page==2) {
			$('.pagination li').last().addClass('disabled');
		}
	});
	
	$.fn.insertAt = function(index,$elem) {
		if(index==0) {
			this.prepend($elem);
		}
		else if(index>=this.first().children().length) {
			this.append($elem);
		} else {
			this.children(':nth-child('+(index+1)+')').before($elem);
		}
		return this;
	};
	
	var activities = [];
	var maxes = [];
	function updateTable() {
		var data = [];
		$('#tbodyNames tr').each(function() {
			if($(this).find('input.names').val() && $(this).find('select.first').val())
				data.push([$(this).find('input.names').val(),$(this).find('select.first').val(),$(this).find('select.second').val(),$(this).find('select.third').val()]);
		});
		$('#tbodyRanks').children().remove();
		if(!data.length) {
			$('#page2').parent().addClass('perm disabled');
			if($('#carousel .active').attr('id')==='div1') $('#next').parent().addClass('disabled');
			$('#download').attr('href','#');
		} else {
			$('#page2').parent().removeClass('perm disabled');
			$('#next').parent().removeClass('disabled');
			var excelData = [['Name','Activity','Rank']];
			var count = [];
			for(var j = 1;j <= 3;j++) {
				for(var i = 0;i < data.length;i++) {
					if(data[i]==true) continue;
					if(data[i][j] && (!count[data[i][j]] || count[data[i][j]] < maxes[data[i][j]])) {
						var $row = $('<tr><td>'+data[i][0]+'</td><td>'+activities[data[i][j]]+'</td><td>'+j+'</td></tr>');
						excelData.push([data[i][0],data[i][j],j]);
						count[data[i][j]] = count[data[i][j]]+1 || 1;
						data[i] = true;
						$('#tbodyRanks').insertAt(i,$row);
					} else if(j===3) {
						var $row = $('<tr class="text-danger"><td></td><td></td><td></td>');
						excelData.push([data[i][0]]);
						data[i] = true;
						$('#tbodyRanks').insertAt(i,$row);
					}
				}
			}
			$('#download').attr('href','data:attachment/csv,' + encodeURIComponent(excelData.join('\r\n')));
		}
	}
	function updateSelects() {
		$('#tbodyActivities tr').each(function() {
			if($(this).find('input.name').val() && $(this).find('input.max').val()) {
				activities[$(this).attr('value')] = $(this).find('input.name').val();
				maxes[$(this).attr('value')] = parseInt($(this).find('input.max').val());
			} else {
				activities[$(this).attr('value')] = false;
				maxes[$(this).attr('value')] = false;
			}
		});
		var count = 1;
		var $all = $('select.names');
		for(var row in activities) {
			var $opt = $all.find('option[value="'+row+'"]');
			if(!activities[row]) {
				if($opt.length) $opt.remove();
			} else {
				if($opt.length) {
					$opt.text(activities[row]);
				} else {
					$all.insertAt(count,'<option value="'+row+'">'+activities[row]+'</option>');
				}
				count++;
			}
		}
		updateTable();
	}
	
	var count = 0;
	var $templateActivities = $('<tr><td style="width: 75%;"><input type="text" class="form-control activity name" /></td><td style="width: 25%;"><input type="number" class="form-control activity max" min="1" /></td></tr>');
	for(var i = 0;i < 10;i++) {
		$('#tbodyActivities').append($templateActivities.clone().attr('value',count++));
	}
	$('#addActivity').click(function(e) {
		$('#tbodyActivities').append($templateActivities.clone().attr('value',count++));
		$(this).blur();
	});
	$('.activity').change(function() {
		updateSelects();
	});
	
	var $templateNames = $('<tr><td style="width: 40%;"><input type="text" class="form-control names" /></td><td style="width: 20%;"><select class="form-control names select first"><option></option></select></td><td style="width: 20%;"><select class="form-control names select second"><option></option></select></td><td style="width: 20%;"><select class="form-control names select third"><option></option></select></td></tr>');
	for(var i = 0;i < 10;i++) {
		$('#tbodyNames').append($templateNames.clone());
	}
	$('#addName').click(function(e) {
		$('#tbodyNames').append($templateNames.clone());
		$(this).blur();
	});
	$('.names').change(function() {
		if($(this).hasClass('select')) {
			var val = $(this).val();
			var $us = $(this);
			$(this).parent().siblings().find('select.select').each(function() {
				if($(this).val()===val) {
					$us.val('').parent().addClass('has-error');
					setTimeout(function($who) {
						$who.removeClass('has-error');
					}, 1000, $us.parent());
					return false;
				}
			});
		}
		updateTable();
	});
});
