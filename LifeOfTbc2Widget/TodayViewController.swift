//
//  TodayViewController.swift
//  LifeOfTbc2Widget
//
//  Created by Andras Bekesi on 13/01/16.
//
//

import UIKit
import NotificationCenter

class TodayViewController: UIViewController, NCWidgetProviding {
    
    var filename:String?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view from its nib.
        if let spinner:UIActivityIndicatorView = self.view.viewWithTag(2000) as? UIActivityIndicatorView,
            imageView:UIImageView = self.view.viewWithTag(1000) as? UIImageView {
                spinner.startAnimating()
                dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0)) {
                    //load json
                    let url1 = NSURL(string: "http://sandbox.sun.bikeonet.hu/~spike/lifeoftbc/json.php?limit=1")
                    let data = NSData(contentsOfURL: url1!)
                    
                    if (( data ) != nil) {
                        do {
                            let json = try NSJSONSerialization.JSONObjectWithData(data!, options: []) as! [String: AnyObject]
                            if let images:NSMutableArray = json["images"] as? NSMutableArray {
                                let dict = images[0];
                                let filename:String = dict["filename"] as! String
                                self.filename = filename
                            
                                print("http://meztelen.hu/asset/medium?filename=",filename)
                                let imageURL:NSURL = NSURL(string: "http://meztelen.hu/asset/medium?filename=\(filename)")!
                                let imageData:NSData = NSData(contentsOfURL: imageURL)!
                                let image:UIImage = UIImage(data: imageData)!
                                dispatch_async(dispatch_get_main_queue()) {
                                    imageView.image = image
                                    spinner.stopAnimating()
                                }
                            }
                        } catch let error as NSError {
                            print("Failed to load: \(error.localizedDescription)")
                            spinner.stopAnimating()
                        }
                    }
                    else {
                        print("Failed to load \(url1)")
                        spinner.stopAnimating()
                    }
                }
        }
        
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    func widgetPerformUpdateWithCompletionHandler(completionHandler: ((NCUpdateResult) -> Void)) {
        // Perform any setup necessary in order to update the view.
        var isError = false
        var isNewData = false
        
        //load json
        let url1 = NSURL(string: "http://sandbox.sun.bikeonet.hu/~spike/lifeoftbc/json.php?limit=1")
        let data = NSData(contentsOfURL: url1!)
        
        if (( data ) != nil) {
            do {
                let json = try NSJSONSerialization.JSONObjectWithData(data!, options: []) as! [String: AnyObject]
                if let images:NSMutableArray = json["images"] as? NSMutableArray {
                    let dict = images[0];
                    let filename:String = dict["filename"] as! String
                    if (( self.filename ) != nil) {
                        if ( self.filename == filename ) {
                            isNewData = false
                        }
                        else {
                            isNewData = true
                        }
                    }
                    else {
                        isNewData = true
                    }
                }
            } catch let error as NSError {
                print("Failed to load: \(error.localizedDescription)")
                isError = true
            }
        }
        else {
            print("Failed to load \(url1)")
            isError = true
        }

        // If an error is encountered, use NCUpdateResult.Failed
        // If there's no update required, use NCUpdateResult.NoData
        // If there's an update, use NCUpdateResult.NewData
        
        if ( isError ) {
            completionHandler(NCUpdateResult.Failed)
        }
        else {
            if ( isNewData ) {
                completionHandler(NCUpdateResult.NewData)
            }
            else {
                completionHandler(NCUpdateResult.NoData)
            }
        }
    }
    
}
