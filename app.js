
var app = new Vue({
    el: '#app',
    data: {
        uri: "http://localhost:3000",
        loggedIn: false,
        showLogin: false,
        showCV: false,
        editMode: false,
        showCVmenu: false,
        error: false,
        errorMsg: "",
        profile: "test",
        password: "test",
        cvList: [],
        cvName: "default",
        fonts: {"Times New Roman": "'Times New Roman', Times, serif"},
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
                    { duration: {from: {year: "2016", month: "01"}, to: {year: "2019", month: "03"}}, title: "Jobb 3", text: "Info..."},
                    { duration: {from: {year: "2015", month: "02"}, to: {year: "2015", month: "11"}}, title: "Jobb 2", text: "Info..."}, 
                    { duration: {from: {year: "2013", month: "09"}, to: {year: "2014", month: "10"}}, title: "Jobb 1", text: "Info..."}]},
                {title: "Education", list: [
                    { duration: {from: {year: "2010", month: ""}, to: {year: "2013", month: ""}}, title: "Study 2", text: "Info..."}, 
                    { duration: {from: {year: "2009", month: ""}, to: {year: "2010", month: ""}}, title: "Study 1", text: "Info..."}]},
                ],
            mainStyle: {
                color: "#000000",
                // 'background-color': "#ffffff", 
                'font-family': "'Times New Roman', Times, serif",
                // 'height': '100%',
            },
        }
        
    },
   
    methods: {

        getDurationText(duration){
            var text = "";
            if(duration.from.month.length > 0) text += duration.from.month + ".";
            text += duration.from.year;
            if(duration.to.year.length > 0) text += "-"
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

        createProfile: function(){
            axios.post(this.uri + "/newProfile", {"profile": this.profile, "password": this.password}).then(res => {
                this.loggedIn = res.data.status;
                this.error = !res.data.status;
                if(this.error) this.errorMsg = res.data.msg;
            }).catch(err => {console.log(err)});
        },

        login: function(){
            axios.post(this.uri + "/login", {"profile": this.profile, "password": this.password}).then(res => {
                this.loggedIn = res.data.status;
                this.error = !res.data.status;
                if(this.error) {this.errorMsg = res.data.msg; return;}
                this.showLogin = false;
                this.showCV = true;
            }).catch(err => {console.log(err)});
        },

        logout: function(){
            this.loggedIn = false;
            this.editMode = false;
            this.openMenu = false;
            this.showCV = false;
            this.profile = "";
            this.password = "";
        },

        save: function(name){
            this.cvName = name;
            this.content.cvName = name;
            axios.post(this.uri + "/saveCV", {"profile": this.profile, "content": this.content}).then(res => {
                if(this.showCVmenu) this.getCVmenu(); 
            }).catch(err => {console.log(err)});
        },

        download: function(){
            var cv = document.getElementById("print");
            var popupWin = window.open('', '_blank', 'width=1200,height=900,location=no,left=200px');
            popupWin.document.open();
            popupWin.document.write('<html><title>Preview</title><link rel="stylesheet" type="text/css" href="cvStyle.css" /></head><body onload="window.print()">'
             + '<div style="' + this.printStyle(this.content.mainStyle) + '">'); 
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
            axios.get(this.uri + "/cvMenu", {"params": {"profile": this.profile}}).then(res => {
                if(res.data.status === false){console.log(res.data.msg); return};
                Vue.set(this, "cvList", res.data);
                this.showCVmenu = true; 
            }).catch(err => {console.log(err)});
        },

        loadData: function(name){
            this.cvName = name;
            axios.get(this.uri + "/getCV", {"params": {"profile": this.profile, "cvName": name}}).then(res => {
                this.content = res.data.content;
                // console.log(res.data);
            }).catch(err => {console.log(err)});
        },

        deleteData: function(name){
            axios.post(this.uri + "/delete", {"profile": this.profile, "cvName": name}).then(res => {
                if(this.showCVmenu) this.getCVmenu();
            }).catch(err => {console.log(err)});   
        },

        deleteAll: function(){
            axios.post(this.uri + "/deleteAll", {"profile": this.profile}).then(res => {
                this.showCVmenu = false;
            }).catch(err => {console.log(err)});   
        }

    },

    mounted() {
        axios.defaults.headers.post["Content-Type"] = "application/json";
        axios.get(this.uri + "/fonts").then(res => {
            if(res.data.length < 1) {this.fonts = {"Times New Roman": "'Times New Roman', Times, serif"}; return};
            for(i in res.data){this.fonts[res.data[i].name] = res.data[i].value;}
        }).catch(err => {console.log(err)});
        if(this.cvName == null) this.cvName = "default";

    }
})


