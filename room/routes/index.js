var express = require('express');
var router = express.Router();
var con = require('../config/config');
const { checkUser } = require("../middlewares/checkUser")


/* GET home page. */
router.get('/', function (req, res, next) {
  //   var today = new Date();
  // var dd = today.getDate();
  // console.log(today.getMonth()+1)
  // var month = today.getMonth()+1;
  // console.log(dd)
  res.render('user/login');
});

router.post('/register', function (req, res, next) {
  var data = req.body;
  var endYear = parseInt(req.body.year) + 4;
  console.log(endYear)
  data.endYear = endYear;
  sql1 = "select * from user where  name = ? and email=? and Rgno = ?"


  var sql2 = "insert into user set ?"
  con.query(sql1, [data.name, data.email, data.Rgno], (err, result) => {
    if (err) {
      console.log(err)
      res.render('user/login', { msg: true })
    }
    else {
      if (result.length > 0) {
        console.log("This email id has been already taken.")
        var msg = "This email id has been already taken."
        res.render('user/login', { msg: true })
      }
      else {
        con.query(sql2, data, (err, result2) => {
          if (err) {
            console.log(err)
            res.render('user/login', { msg: true })
          }
          else {
            var msg = "Login to continue"
            console.log("success")
            res.render('user/login', { msg: true })
          }
        })
      }
    }
  })


});

router.post('/login', function (req, res, next) {
  console.log(req.body);
  const d = new Date();
  let year = d.getFullYear();
  console.log(year);
  var email = req.body.email;
  var pass = req.body.password;
  var sql = "select * from user where email=? and password=?"
  con.query(sql, [email, pass], (err, result) => {
    if (err) {
      console.log(err);
    }
    else {
      if (result.length > 0) {
        var endY = (result[0].endYear);
        var sYear = (result[0].Year);
        var gap = endY - sYear;
        req.session.user = result[0];
        console.log("//////", gap)
        if (gap <= 4) {
          console.log("login successfull")
          req.session.user = result[0];
          res.redirect('/home')

        } else {
          res.render('user/errorPage')


        }
      } else {
        console.log("login error")
      }
    }
  })
});

router.get('/home', checkUser, function (req, res, next) {
  var user = req.session.user;
  // console.log(user)
  var mail = req.session.user.email;
  var msg;
  var today = new Date();
  var dd = today.getDate();

  var month = today.getMonth() + 1;

  var userMonth;
  var userDate;
  sql = "select * from user"
  con.query(sql, (err, result) => {
    if (err) {
      console.log(err)
    } else {
      userMonth = result[0].month;
      userDate = result[0].date;

      sql2 = " select * from post"
      con.query(sql2, (err, post) => {
        if (err) {
          console.log(err)
        } else {
          sql3 = "select * from msg where toId = ?"
          con.query(sql3, [mail], (err, msg) => {
            if (err) {
              console.log(err)
            } else {
              msg = msg;
              //req.session.user.email
              var msg = "Hope all your birthday wishes come true!";
              var mail = req.session.user.email;
              var data = {
                msg: msg,
                mail: mail,
                day: userDate,
                month: userMonth
              }
              if (dd == userDate && month == userMonth) {
                sql = `insert into bday set ?`
                //var mail = req.session.user.email;
                con.query(sql, data, (err, bday) => {
                  if (err) {
                    console.log(err)
                  } else {

                    res.render('user/home', { user, data: result, post, msg });

                  }
                })
              }

              res.render('user/home', { user, data: result, post, msg });
            }
          })

        }
      })

    }
  })

});
router.post('/search-user', checkUser, (req, res) => {
  let { user } = req.session
  let name = req.body.search;
  let sql = "select * from user where name like '%" + name + "%'"
  con.query(sql, (err, result) => {
    if (err) {
      console.log(err)
    } else {
      if (result.length == 0) {
        result = false
      } else {
        userMonth = result[0].month;
        userDate = result[0].date;
      }
      res.render("user/searchList", { data: result, user })
    }
  })
})
router.post('/addimg', (req, res) => {
  console.log(req.files)
  console.log(req.body)



  var image_name;
  if (!req.files) return res.status(400).send("no files were uploaded.");

  var file = req.files.img;
  var image_name = file.name;
  let sql = "update user set img = ? where id = ?";

  console.log(file)
  console.log(image_name);
  if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif"
  ) {
    file.mv("public/images/profile/" + file.name, function (err) {
      if (err) return res.status(500).send(err);
      console.log(image_name);
      con.query(sql, [image_name, req.body.userID], (err, result) => {
        if (err) {
          console.log(err)
        } else {
          res.redirect('/home')

        }
      })
    })
  }
})
router.post('/addpost', (req, res) => {
  if (!req.files) return res.status(400).send("no files were uploaded.");
  var file = req.files.img;
  var image_name = file.name;
  sql = "Insert into post set ?"
  console.log(file)
  console.log(image_name);
  var data = {
    img: image_name,
    mail: req.session.user.email,
    dis: req.body.dis
  }
  if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif"
  ) {
    file.mv("public/images/post/" + file.name, function (err) {
      if (err) return res.status(500).send(err);
      console.log(image_name);
      con.query(sql, data, (err, result) => {
        if (err) {
          console.log(err)
        } else {
          res.redirect('/home')

        }
      })
    })
  }
})

router.post('/msg', (req, res) => {
  if (!req.files) return res.status(400).send("no files were uploaded.");
  var file = req.files.img;
  var image_name = file.name;
  sql = "Insert into msg set ?"
  console.log(file)
  console.log(image_name);
  var data = {
    img: image_name,
    toId: req.body.mail,
    fromId: req.session.user.email,
    msg: req.body.msg
  }
  if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif"
  ) {
    file.mv("public/images/msg/" + file.name, function (err) {
      if (err) return res.status(500).send(err);
      console.log(image_name);
      con.query(sql, data, (err, result) => {
        if (err) {
          console.log(err)
        } else {
          res.redirect('/home')

        }
      })
    })
  }
})

router.get('/message', (req, res) => {
  sql = "select * from msg where toId = ?"
  var user = req.session.user;
  con.query(sql, [req.session.user.email], (err, chat) => {
    if (err) {
      console.log(err)
    } else {
      console.log(chat)
      res.render('user/chat', { chat, user })
    }
  })
})
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

router.get('/notification', (req, res) => {
  sql = "select * from bday where month = ? and day = ?"
  var today = new Date();
  var dd = today.getDate();
  var month = today.getMonth() + 1;
  // var mail = result[0].mail;
  // var msg = result[0].msg;
  con.query(sql, [month, dd], (err, result) => {
    if (err) {
      console.log(err);
      res.render('user/errorPage')
    } else {
      var user = req.session.user;
      res.render('user/bday', { bday: result[0], data: true, user })
    }
  })
})
module.exports = router;
