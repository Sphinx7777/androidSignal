

import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import makeStore from './signalApp/redux/store';
// import TestedOnly from './signalApp/TestedOnly';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StyleSheet } from 'react-native';
import { PersistGate } from 'redux-persist/integration/react'
import Signal from './signalApp/components/Signal/index';
import Login from './signalApp/components/Signal/Login';
import Details from 'signalApp/components/Signal/Details';

const App = () => {
    const store = makeStore()
    const Drawer = createDrawerNavigator();
    return (
        <Provider store={store.store}>
            <PersistGate loading={null} persistor={store.persistor}>
            <NavigationContainer>
                <Drawer.Navigator initialRouteName='Home' drawerStyle={styles.drawerStyle}>
                    <Drawer.Screen name='Home' component={Signal} options={{ title: 'Main page' }} />
                    <Drawer.Screen name='Login' component={Login} options={{ title: 'Authorization' }} />
                    <Drawer.Screen name='Details' component={Details} />
                    {/* <Drawer.Screen name='Test' component={TestedOnly} options={{ title: 'Test' }} /> */}
                </Drawer.Navigator>
            </NavigationContainer>
            </PersistGate>
        </Provider>
    );
}

const styles = StyleSheet.create({
    drawerStyle: {
        backgroundColor: '#fff',
        width: 240,
        paddingTop: 50
    }
});

export default App;