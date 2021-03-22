package com.androidsignal;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.uimanager.IllegalViewOperationException;
import android.content.Intent;
import android.net.Uri;
import android.app.Activity;
import android.content.Context;


public class DirectDialModule extends ReactContextBaseJavaModule {

    public DirectDialModule(ReactApplicationContext reactContext) {
        super(reactContext); //required by React Native
    }

    @Override
    //getName is required to define the name of the module represented in JavaScript
    public String getName() {
        return "DirectDial";
    }

    @ReactMethod
    public void createDial(String number, Promise res) {
        try {    
        Intent call = new Intent(Intent.ACTION_CALL);
        call.setData(Uri.parse("tel:" + number));
        // startActivity(call);
        res.resolve(call.toString());
        } catch (Exception ex) {
            res.resolve(false);
            //System.out.println("couldn't send message.");
        }
    }
}