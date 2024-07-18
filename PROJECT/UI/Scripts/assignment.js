"use strict";


var server='localhost:5002'

var pagination = document.querySelector('#pageLists');
//var prevButton = document.querySelector("#pagination-template").querySelector("#li-prev").querySelector('#prevButton');
//var  nextButton = document.querySelector("#pagination-template").querySelector("#li-next").querySelector('#nextButton');
var  currentPage = 1;
var  itemsPerPage = 10;
var totalPages = 0;

var modal=document.querySelector("#form1");
var span = document.getElementsByClassName("close")[0];

function openModal(){
    modal.style.display = "block";
}

  
function closeModal() {
    modal.style.display = "none";
}
  
window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
}

function loadDataIntoForm(data){
        document.querySelector("#name").value=data.name;
        var selectedGender=document.getElementsByName("gender");
        for(var gender of selectedGender){
              if(gender.value===data.gender){
                    gender.checked=true;
                    break;
               }
        }
        document.querySelector("#contact").value=data.contact;
        document.querySelector("#address").value=data.address;
        document.querySelector('#form1').setAttribute('data-id',data.id);
        
}

function editRow(self){
      openModal();
      var userId =self.parentNode.parentNode.dataset.id;
      fetch(`http://${server}/user/${userId}`).then(x=>x.json()).then(x=>loadDataIntoForm(x));
      if(document.querySelector('.js-add-button').className === "fn-add"){
            document.querySelector('.js-add-button').className="fn-update"; 
        }
      
}
       


function updateRow(data){
      var tr=Array.from(document.querySelectorAll('tr')).filter(x=>x.dataset.id==data.id)[0];
      var table_temp=document.querySelector("#table-template-update").innerHTML;
      var table_data = table_temp.replace("{{name}}",data.name)
                      .replace("{{gender}}",data.gender)
                      .replace("{{contact}}",data.contact)
                      .replace("{{address}}",data.address)
                      .replace("{{userId}}",data.id);
      tr.innerHTML=table_data;
      document.querySelector('#form1').setAttribute('data-id',null);
}


function loadDataInTable(data){
      var table_temp=document.querySelector("#table-template").innerHTML;
      data.sort(x=>-x.id);
      for( var item of data)
        {

            var table_data = table_temp.replace("{{name}}",item.name)
            .replace("{{gender}}",item.gender)
            .replace("{{contact}}",item.contact)
            .replace("{{address}}",item.address)
            .replace("{{userId}}",item.id);
            var tbody_html=document.querySelector("#myTable")
                                    .querySelector("tbody");

            tbody_html.innerHTML=tbody_html.innerHTML+table_data;

        }

                   
}

async function init(){
      var start=(currentPage-1)*itemsPerPage;
      var end=itemsPerPage;
      var response = fetch(`http://${server}/users?start=${start}&end=${end}`).then(x=>x.json());
      var d=await response;
      loadDataInTable(d);

}
  
async function search(){
      //document.querySelectorAll('tr').style.backgroundColor='';
      var data=document.querySelector("#searchQuery").value;
      var a=fetch(`http://${server}/search/${encodeURIComponent(data)}`).then(x=>x.json());
      var b=await a;
      document.querySelector('#myTable').querySelector('tbody').innerHTML='';
      loadDataInTable(b);
      document.querySelector("#searchQuery").value="";
}

function deleteDataFromTable(self){
    var userId =self.parentNode.parentNode.dataset.id;
    var tr=Array.from(document.querySelectorAll('tr')).filter(x=>x.dataset.id==userId)[0];
    fetch(`http://${server}/deleteuser/`+(+userId),{method:"DELETE"}).then(x=>x.json()).then(x=>console.log(x));
    document.querySelector("#myTable").deleteRow(tr.rowIndex);
}

function getFormData(){
      var userId=document.querySelector('#form1').dataset.id;
      var name = document.querySelector("#name").value;
      var gender = Array.from(document.getElementsByName("gender"))
                          .filter(x=>x.checked)
                          .map(x=>x.value)[0];
      var address = document.querySelector("#address").value;
      var contact = document.querySelector("#contact").value;
      return {"name":name,"gender":gender,"contact":contact,"address":address,"id":userId};
      
}

function proceessMessage(res){

      if(res.status==200){
  
           return res.json();
      }else
      {
          return Promise.reject(res);
      }
  }
  

async function addDataIntoTable(){
      var data=getFormData();
      if(data.id && data.id!='undefined'){
            fetch(`http://${server}/user`,{
              method: "PUT",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(data)
            }).then(x=>x.json()).then(x=>updateRow(x));
            if(document.querySelector('.js-add-button').className === "fn-update"){
                  document.querySelector('.js-add-button').className="fn-add";
              }
        }
      else{
            var z= fetch(`http://${server}/user`,{
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(data)
            }).then(proceessMessage).catch(x=>x.json().then(y=>alert(y['Error'])));
            var y=await z;
            document.querySelector('#myTable').querySelector('tbody').innerHTML='';
            init();

      }
      resetForm();

}



function resetForm(){
    document.querySelector("#name").value="";
    var gender=document.getElementsByName("gender");
    for (var i=0;i<gender.length;i++){
          gender[i].checked=false;
    }
    document.querySelector("#contact").value="";
    document.querySelector("#address").value="";
  
}


async function renderPage(page) {
      var t=fetch(`http://${server}/datacount`).then(x=>x.json());
      var tc=await t;
      var totalItems = tc.length;
      totalPages = Math.ceil(totalItems / itemsPerPage);
            //createPagination();
      var paginationNav=document.querySelector(".pageNavigation").querySelector(".fn-ul");
      //var paginationTemp=document.querySelector("#pagination-template");
      var lst="";
      var li=document.querySelector("#li-template").innerHTML;
      for(let i=0;i<totalPages;i++)
            {
                  lst+=li.replace("{{num}}",i+1).replace("{{start}}",(i*10)+1).replace("{{end}}",(i+1)*10);
                    
            }
      paginationNav.innerHTML=paginationNav.innerHTML.replace("{{pages}}",lst);
      var a=document.querySelectorAll(".fn-page-button");
      var prevButton=paginationNav.querySelector("#prevButton");

      var nextButton=paginationNav.querySelector("#nextButton");

      for(var j=0;j<a.length;j++)
            {
                  a[j].addEventListener("click",function(self){
                        document.querySelector('#myTable').querySelector('tbody').innerHTML='';
                              //alert(self.currentTarget.dataset["start"]+"-"+self.currentTarget.dataset["end"]);
                        fetch(`http://${server}/users?start=${self.currentTarget.dataset["start"]-1}&end=${self.currentTarget.dataset["end"]-self.currentTarget.dataset["start"]+1}`).then(x=>x.json()).then(x=>loadDataInTable(x));
                        currentPage = parseInt(self.currentTarget.innerHTML);
                        console.log(currentPage);
                        prevButton.classList.toggle('disabled',currentPage===1);
                        nextButton.classList.toggle('disabled',currentPage=== totalPages);
                        
                  });                    
            }
      init();
      prevButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 1) {
                  goToPage(currentPage - 1);
            }
      });
      
      nextButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage < totalPages) {
                  goToPage(currentPage + 1);
            }
      });
}


function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
            currentPage = page;
            document.querySelector('#myTable').querySelector('tbody').innerHTML='';
            renderPage(page);
      }
}

renderPage(currentPage);


