package com.androidsignal;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.uimanager.IllegalViewOperationException;
import android.telephony.SmsManager;


public class DirectSmsModule extends ReactContextBaseJavaModule {

    public DirectSmsModule(ReactApplicationContext reactContext) {
        super(reactContext); //required by React Native
    }

    @Override
    //getName is required to define the name of the module represented in JavaScript
    public String getName() {
        return "DirectSms";
    }

    @ReactMethod
    public void sendDirectSms(String numbers, String msg, Promise res) {
        try {    
            SmsManager smsManager = SmsManager.getDefault();
            smsManager.sendTextMessage(numbers, null, msg, null, null);
            res.resolve(true);
        } catch (Exception ex) {
            res.resolve(false);
            //System.out.println("couldn't send message.");
        }
    }
}