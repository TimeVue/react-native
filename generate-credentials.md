# generating Credentials
## Android
```shell
keytool \\
 -genkey -v \\
 -storetype JKS \\
 -keyalg RSA \\
 -keysize 2048 \\
 -validity 10000 \\
 -storepass KEYSTORE_PASSWORD \\
 -keypass KEY_PASSWORD \\
 -alias KEY_ALIAS \\
 -keystore release.keystore \\
 -dname "CN=de.itmediahof.timevue,OU=,O=,L=,S=,C=DE"
```