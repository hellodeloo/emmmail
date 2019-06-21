export const folderConf = {
  folder: 'em'
};

export const emConf = {
  folder: folderConf.folder,
  emailUrl: 'http://www.host.com/' + folderConf.folder + '/',
  emailDir: '/public_html/' + folderConf.folder,
  emailSender: 'sender@email.com',
  emailRecipient: 'recipient@email.com',
  emailSubject: 'Test: ' + folderConf.folder
};

export const ftpConf = {
  host: 'ftp.host.com',
  user: 'user',
  password: 'password',
  parallel: 10
};

export const smtpConf = {
  auth: {
    user: 'smtp@user.com',
    pass: 'pass'
  },
  host: 'smtp.host.com',
  secureConnection: false,
  port: 587
};
