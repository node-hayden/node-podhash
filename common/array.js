var reg = /^[0-9]+$/;

function sortVersion(a, b){
    console.log(a + " : "+b);
    var indexA = a.indexOf(".");
    var indexB = b.indexOf(".");
    var aPrefix = indexA>-1? a.substring(0, indexA) : a;
    var bPrefix = indexB>-1? b.substring(0, indexB) : b;
    if(reg.test(aPrefix) && reg.test(bPrefix)){
        var iA = parseInt(aPrefix);
        var iB = parseInt(bPrefix);
        if(iA>iB){
            return 1;
        }else  if(iA<iB){
            return -1;
        }
    }else{
        if(aPrefix>bPrefix){
            return 1;
        }else if(aPrefix<bPrefix){
            return -1;
        }
    }

    var aSuffix = "";
    var bSuffix = "";
    if(indexA>-1 && indexA< a.length-1){
        aSuffix = a.substring(indexA+1);
    }
    if(indexB>-1 && indexB< b.length-1){
        bSuffix = b.substring(indexB+1);
    }
    if(aSuffix.length>0 && bSuffix.length==0){
        return 1;
    }else if(aSuffix.length==0 && bSuffix.length>0){
        return -1;
    }else if(aSuffix==bSuffix){
        return 0;
    }else{
        return sortVersion(aSuffix, bSuffix);
    }
}

module.exports.sortVersion = function(array){
    array.sort(function(a, b){
        return sortVersion(a, b);
    });
}

module.exports.sortModuleVersion = function(array){
    array.sort(function(a, b){
        return sortVersion(a.version, b.version);
    });
}