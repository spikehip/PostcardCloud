#!/bin/bash
export ANDROID_HOME=~/Library/Android/sdk
export JAVA_HOME=$(/usr/libexec/java_home)
gulp remove-proxy
ionic build android
cp platforms/android/build/outputs/apk/android-debug.apk www/
~/Library/Android/sdk/platform-tools/adb uninstall com.ionicframework.lifeoftbc2185233
~/Library/Android/sdk/platform-tools/adb install platforms/android/build/outputs/apk/android-debug.apk
gulp add-proxy

