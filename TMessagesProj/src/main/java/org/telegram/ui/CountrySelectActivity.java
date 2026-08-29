/*
 * This is the source code of Telegram for Android v. 12.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.ui;

import android.content.Context;
import android.os.Bundle;
import android.view.View;
import org.telegram.messenger.AccountInstance;
import org.telegram.messenger.NotificationCenter;
import org.telegram.messenger.UserConfig;
import org.telegram.ui.ActionBar.BaseFragment;

public class CountrySelectActivity extends BaseFragment {

    public interface CountrySelectActivityDelegate {
        void didSelectCountry(Country country);
    }

    public static class Country {
        public String name;
        public String defaultName;
        public String code;
        public String shortname;
    }

    private CountrySelectActivityDelegate delegate;
    private boolean needPhoneCode;

    public CountrySelectActivity(boolean phoneCode) {
        super();
        this.needPhoneCode = phoneCode;
    }

    public void setCountrySelectActivityDelegate(CountrySelectActivityDelegate delegate) {
        this.delegate = delegate;
    }

    @Override
    public View createView(Context context) {
        fragmentView = new View(context);
        return fragmentView;
    }
}
