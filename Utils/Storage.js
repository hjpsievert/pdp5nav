import {
    AsyncStorage
} from 'react-native';
import size from 'lodash/size';
import flatMap from 'lodash/flatMap';

export const readKeys = async (cb, contentType) => {
    let newKeys = [];
    let keys = [];
    // console.log('Storage contentType =', contentType);
    try {
        keys = await AsyncStorage.getAllKeys();
        if (keys !== null) {

            // We have data!!
            // console.log('Storage key list = ', keys);
            for (var i = 0; i < keys.length; i++) {
                if (contentType.length === 0 || contentType.indexOf((keys[i] + '@@@').split('@@@')[1]) > -1) {
                    const value = await AsyncStorage.getItem(keys[i]);
                    if (value !== null) {
                        // We have data!!
                        //console.log('value ' + value);
                        const newObj = JSON.parse(value);
                        //console.log('keys[' + i + '] = ' + keys[i]);

                        // console.log('newObj ' + value);

                        newKeys.push(newObj);
                    }
                }
            }
            cb({ success: true, payload: newKeys });
        }
    }
    catch (error) {
        // Error retrieving data
        console.log(error);
        cb(null);
    }
}

// export const readNumKeys = async (cb, contentType) => {
//     let keys = [];
//     try {
//         keys = await AsyncStorage.getAllKeys();
//         if (keys !== null) {
//             // console.log('readNumKeys: keys ' + JSON.stringify(keys));
//             // We have data!!
//             keys = keys.filter((kk) => kk.indexOf('@@@' + contentType) > 0);
//             cb(keys.length);
//             //console.log('readNumKeys: return ' + keys.length);
//         }
//     } catch (error) {
//         console.log(error);
//         // Error retrieving data
//         cb(null);
//     }
// }

export const removeAllKeys = async (cb, contentType) => {
    let keys = [];
    try {
        keys = await AsyncStorage.getAllKeys();
        if (keys !== null) {
            // We have data!!
            if (contentType.length > 0) {
                keys = keys.filter((kk) => kk.indexOf(contentType) > -1);
            }

            for (var i = 0; i < keys.length; i++) {
                try {
                    await AsyncStorage.removeItem(keys[i]);
                } catch (error) {
                    // Error retrieving data
                    console.log('Error ' + error);
                    cb(null);
                }
            }
            cb('OK');
            //console.log('readNumKeys: return ' + keys.length);
        }
    } catch (error) {
        console.log(error);
        // Error retrieving data
        cb(null);
    }
}

export const removeKey = async (cb, myKey) => {
    try {
        await AsyncStorage.removeItem(myKey);
        cb({ status: 'ok' });
    } catch (error) {
        cb({ status: 'Error in removeKey: ' + error });
    }
}

export const saveDrugs = async (cb, userData) => {

    const currDate = new Date();
    const dateStamp = currDate.toLocaleDateString('en-US') + ' ' + currDate.toLocaleTimeString('en-US');

    try {
        const { storageIndex, contentType } = userData;
        let newObj = { ...userData, dateStamp: dateStamp }

        console.log('saveDrugs to ', storageIndex + '@@@' + contentType);
        await AsyncStorage.setItem(storageIndex + '@@@' + contentType, JSON.stringify(newObj));
        cb({ success: true, payload: 'Drug list saved' });
    } catch (error) {
        // Error saving data
        console.log(error);
        cb({ success: false, payload: error });
    }
}

export const saveErrorLocally = async (cb, userData) => {

    const currDate = new Date();
    const dateStamp = currDate.toLocaleDateString('en-US') + ' ' + currDate.toLocaleTimeString('en-US');

    try {
        let newObj = { ...userData, dateStamp: dateStamp }

        await AsyncStorage.setItem('0@@@appError', JSON.stringify(newObj));
        cb({ success: true, payload: 'Error saved' });
    } catch (error) {
        // Error saving data
        console.log(error);
        cb({ success: false, payload: error });
    }
}

export const saveProfile = async (cb, userProfile) => {

    const currDate = new Date();
    const dateStamp = currDate.toLocaleDateString('en-US') + ' ' + currDate.toLocaleTimeString('en-US');

    try {
        let newObj = { dateStamp: dateStamp, payload: JSON.stringify(userProfile) };

        await AsyncStorage.setItem('0@@@userProfile', JSON.stringify(newObj));
        cb({ success: true, payload: 'User profile saved' });
    } catch (error) {
        // Error saving data
        console.log(error);
        cb({ success: false, payload: error });
    }
}

export const loadObject = async (cb, storageIndex, objType) => {
    try {
        //console.log('loadObject loadTitle = ' + loadTitle + ', objType = ' + objType);

        const value = await AsyncStorage.getItem(storageIndex + '@@@' + objType);

        if (value !== null) {
            // We have data!!
            const newObj = JSON.parse(value);
            //console.log('loadObject value =' + value);
            cb({ success: true, payload: JSON.parse(newObj.payload) }, 'Storage');
        }
        else {
            cb({ success: false, payload: "No data" })
        }

    } catch (error) {
        // Error retrieving data
        console.log(error);
        cb({ success: false, payload: error });
    }

}

export const getIndex = async (cb) => {
    try {
        // const rem = await AsyncStorage.removeItem('StorageIndex');
        // console.log('getIndex rem = ', rem);
        const value = await AsyncStorage.getItem('StorageIndex');
        let index = 1;

        if (value != null && !isNaN(value)) {
            index = value;
        }
        // console.log('getIndex = ', index)
        cb({ success: true, index: index });

    } catch (error) {
        // Error retrieving data
        console.log('getIndex ', error);
        cb({ success: false, error: error });
    }
}

export const saveIndex = async (cb, index) => {
    try {
        await AsyncStorage.setItem('StorageIndex', index.toString());
        // console.log('saveIndex = ', index.toString())
        cb({ success: true, index: index });
    } catch (error) {
        // Error saving data
        console.log('saveIndex ', error);
        cb({ success: false, error: error });
    }
}

