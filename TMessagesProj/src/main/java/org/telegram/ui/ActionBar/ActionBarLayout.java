/*
 * This is the source code of Telegram for Android v. 11.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.ui.ActionBar;

import android.content.Context;
import android.widget.FrameLayout;
import java.util.ArrayList;

public class ActionBarLayout extends FrameLayout {
    public ArrayList<BaseFragment> fragmentsStack = new ArrayList<>();
    private boolean transitionAnimationInProgress;

    public ActionBarLayout(Context context) {
        super(context);
    }

    public void removeAllFragments() {
        for (BaseFragment fragment : fragmentsStack) {
            fragment.onFragmentDestroy();
        }
        fragmentsStack.clear();
        removeAllViews();
    }

    public void addFragmentToStack(BaseFragment fragment) {
        if (fragmentsStack.contains(fragment)) {
            return;
        }
        fragment.setParentLayout(this);
        fragmentsStack.add(fragment);
        if (fragment.onFragmentCreate()) {
            addView(fragment.createView(getContext()));
            fragment.onResume();
        }
    }

    public boolean presentFragment(BaseFragment fragment) {
        return presentFragment(fragment, false, false);
    }

    public boolean presentFragment(BaseFragment fragment, boolean removeLast) {
        return presentFragment(fragment, removeLast, false);
    }

    public boolean presentFragment(BaseFragment fragment, boolean removeLast, boolean forceWithoutAnimation) {
        if (fragment == null || transitionAnimationInProgress) {
            return false;
        }
        fragment.setParentLayout(this);
        if (!fragment.onFragmentCreate()) {
            return false;
        }
        if (removeLast && !fragmentsStack.isEmpty()) {
            BaseFragment currentLast = fragmentsStack.remove(fragmentsStack.size() - 1);
            currentLast.onPause();
            currentLast.onFragmentDestroy();
            removeView(currentLast.getFragmentView());
        }
        fragmentsStack.add(fragment);
        addView(fragment.createView(getContext()));
        fragment.onResume();
        return true;
    }

    public void closeLastFragment(boolean animated) {
        if (fragmentsStack.size() <= 1 || transitionAnimationInProgress) {
            return;
        }
        BaseFragment current = fragmentsStack.remove(fragmentsStack.size() - 1);
        current.onPause();
        current.onFragmentDestroy();
        removeView(current.getFragmentView());

        if (!fragmentsStack.isEmpty()) {
            BaseFragment previous = fragmentsStack.get(fragmentsStack.size() - 1);
            previous.onResume();
        }
    }

    public BaseFragment getLastFragment() {
        if (fragmentsStack.isEmpty()) {
            return null;
        }
        return fragmentsStack.get(fragmentsStack.size() - 1);
    }
}
