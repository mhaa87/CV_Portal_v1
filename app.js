
var app = new Vue({
    el: '#app',
    data: {
        uri: "http://localhost:3000",
        loggedIn: false,
        key: null,
        showLogin: false,
        register: false,
        page: "home",
        editMode: false,
        showCVmenu: false,
        error: false,
        automaticLogin: false,
        user: {
            name: "testname",
            email: "test@mail.com",
            password: "testpassword",
        },
        errorMsg: "",
        cvList: [],
        cvName: "default",
        fonts: [
            {name: "Times New Roman",  value: "'Times New Roman', Times, serif", style:{'font-family': "'Times New Roman', Times, serif"}},
            {name: "Arial",  value: "Arial, Helvetica, sans-serif", style:{'font-family': "Arial, Helvetica, sans-serif"}},
            {name: "Arial Black",  value: "'Arial Black', Gadget, sans-serif", style:{'font-family': "'Arial Black', Gadget, sans-serif"}}
        ],
        defaultListElement: { duration: {from: {year: "2000", month: "01"}, to: {year: "2000", month: "01"}}, title: "Tittel", text: "Info..."},
        content: {
            name: "Firstname Lastname",
            personInfo: [
                {title: "Mobile", text: "12345678"},
                {title: "Email", text: "email@hotmail.com"},
                {title: "Place", text: "City"},
            ],
            profileImg: "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png",
            intro: {title: "Introduction", text: "..."},
            other: {title: "Other", text: "..."},
            lists: [
                {title: "Experience", list: [
                    { duration: {from: {year: "2016", month: "01"}, to: {year: "2019", month: "03"}}, title: "Job 3", text: "Info..."},
                    { duration: {from: {year: "2015", month: "02"}, to: {year: "2015", month: "11"}}, title: "Job 2", text: "Info..."}, 
                    { duration: {from: {year: "2013", month: "09"}, to: {year: "2014", month: "10"}}, title: "Job 1", text: "Info..."}]},
                {title: "Education", list: [
                    { duration: {from: {year: "2010", month: ""}, to: {year: "2013", month: ""}}, title: "Study 2", text: "Info..."}, 
                    { duration: {from: {year: "2009", month: ""}, to: {year: "2010", month: ""}}, title: "Study 1", text: "Info..."}]},
            ],
            font: {
                'font-family': "'Times New Roman', Times, serif",
            },
            layout: {

            }
        }
        
    },
   
    methods: {
        getDurationText(duration){
            var text = "";
            if(duration.from.month.length > 0) text += duration.from.month + ".";
            text += duration.from.year;
            if(duration.to.year.length > 0) text += "-";
            if(duration.to.month.length > 0) text += duration.to.month + ".";
            if(duration.to.year.length > 0) text += duration.to.year;
            return text;
        },

        sortListElements: function (a, b) {
            var from = this.dateToNumber(b.duration.from.month, b.duration.from.year) - this.dateToNumber(a.duration.from.month, a.duration.from.year)
            var to = this.dateToNumber(b.duration.to.month, b.duration.to.year) - this.dateToNumber(a.duration.to.month, a.duration.to.year)
            return (to === 0) ?  from : to;
        },

        dateToNumber(month, year){
            if(year.length > 0) return (year * 100 + ((month.length > 0) ? month*1 : 0));
            return 0;
        },

        login: function(){
            axios.post(this.uri + "/login", {"createUser": this.register, "key": this.key, "user": this.user}).then(res => {
                this.loginResult(res.data);
            }).catch(err => {console.log(err)});                
        },

        autoLogin: function(){
            axios.post(this.uri + "/login", {"createUser": false, "key": this.key, "user": false}).then(res => {
                this.loginResult(res.data);
                this.error = false;
            }).catch(err => {console.log(err)});
        },

        loginResult(data){
            // console.log(data);
            this.loggedIn = data.status;
            this.error = !data.status;
            if(this.error) {this.errorMsg = data.msg; return;}
            this.showLogin = false;
            this.key = data.key;
            localStorage.setItem("key", data.key);
            localStorage.setItem("autoLogin", this.automaticLogin ? 'true' : 'false');
            this.user.name = data.name;
        },

        logout: function(){
            this.loggedIn = false;
            this.editMode = false;
            this.openMenu = false;
            this.user = {};
        },

        save: function(name){
            this.cvName = name;
            this.content.cvName = name;
            axios.post(this.uri + "/saveCV", {"key": this.key, "content": this.content}).then(res => {
                if(this.showCVmenu) this.getCVmenu(); 
            }).catch(err => {console.log(err)});
        },

        download: function(){
            var cv = document.getElementById("print");
            var popupWin = window.open('', '_blank', 'width=' + screen.width*0.46 + 'px,height=900,location=no,left=200px');
            popupWin.document.open();
            popupWin.document.write('<html><title>Preview</title><link rel="stylesheet" type="text/css" href="cvStyle.css" /></head><body onload="window.print()">'
             + '<div style="' + this.printStyle(this.content.font) + '">'); 
            popupWin.document.write(cv.innerHTML);
            popupWin.document.write('</div></body></html>');
            popupWin.document.close();
        },

        printStyle: function(styles){
            var style = "";
            for(var prop in styles) style += prop + ":" + styles[prop] + "; ";
            return style;
        },

        toggleCVmenu: function(){
            if(this.showCVmenu){this.showCVmenu = false; return};
            this.getCVmenu();
        },

        getCVmenu: function(){
            axios.post(this.uri + "/cvMenu", {"key": this.key}).then(res => {
                if(res.data.status === false){console.log(res.data.msg); return};
                Vue.set(this, "cvList", res.data);
                this.showCVmenu = true; 
            }).catch(err => {console.log(err)});
        },

        loadData: function(name){
            this.cvName = name;
            axios.post(this.uri + "/getCV", {"key": this.key, "cvName": name}).then(res => {
                this.content = res.data.content;
            }).catch(err => {console.log(err)});
        },

        deleteData: function(name){
            axios.post(this.uri + "/delete", {"key": this.key, "cvName": name}).then(res => {
                if(this.showCVmenu) this.getCVmenu();
            }).catch(err => {console.log(err)});   
        },

        deleteAll: function(){
            axios.post(this.uri + "/deleteAll", {"key": this.key}).then(res => {
                this.showCVmenu = false;
            }).catch(err => {console.log(err)});   
        }

    },

    mounted() {
        axios.defaults.headers.post["Content-Type"] = "application/json";
        axios.get(this.uri + "/fonts").then(res => {
            if(res.data.length < 1) return;
            this.fonts = res.data.map(font => {
                return {name: font.name, value: font.value, style: {'font-family': font.name}};
            });
        }).catch(err => {console.log(err)});
        if(this.cvName == null) this.cvName = "default";
        this.automaticLogin = localStorage.getItem("autoLogin") === "true";
        if(this.automaticLogin){
            this.key = localStorage.getItem("key"); 
            if(this.key != null && this.key.length > 0) this.autoLogin();
        }

    }
})


